require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;


mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => {
        console.error('MongoDB Connection Error:', err);
        console.log('Please make sure you have a .env file with MONGODB_URI defined.');
    });


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));


app.use(session({
    secret: process.env.SESSION_SECRET || 'secret_key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 } 
}));


app.set('view engine', 'ejs');



const authRoutes = require('./routes/authRoutes');
const videoRoutes = require('./routes/videoRoutes');
const userRoutes = require('./routes/userRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const studioRoutes = require('./routes/studioRoutes');
const apiRoutes = require('./routes/apiRoutes');
const playlistRoutes = require('./routes/playlistRoutes');
const adminRoutes = require('./routes/adminRoutes');


const { checkBan } = require('./middleware/auth');

app.use(async (req, res, next) => {
    const currentIp = req.ip || req.connection.remoteAddress;
    res.locals.ip = currentIp;

    if (req.session.user) {
        try {
            const User = require('./models/User');
            
            const freshUser = await User.findById(req.session.user._id)
                .populate('following', 'username avatarUrl')
                .lean();
            if (freshUser) {
                req.session.user = freshUser;
                
                User.updateOne({ _id: freshUser._id }, { lastIp: currentIp }).exec();
            }

            res.locals.user = req.session.user || null;

            const Notification = require('./models/Notification');
            const unreadCount = await Notification.countDocuments({ recipient: req.session.user._id, read: false });
            res.locals.unreadCount = unreadCount;
        } catch (err) {
            console.error('Session sync error:', err);
            res.locals.user = req.session.user || null;
            res.locals.unreadCount = 0;
        }
    } else {
        res.locals.user = null;
        res.locals.unreadCount = 0;
    }
    next();
});

app.get('/banned', async (req, res) => {
    const ip = req.ip || req.connection.remoteAddress;
    const User = require('./models/User');

    
    const isUserBanned = req.session.user && req.session.user.isBanned;

    
    const bannedUserByIp = await User.findOne({ bannedIps: ip, isBanned: true });

    if (!isUserBanned && !bannedUserByIp) {
        return res.redirect('/');
    }

    res.render('banned', { ip, user: res.locals.user });
});

app.use(checkBan);

app.use(authRoutes);
app.use(userRoutes);
app.use(videoRoutes);
app.use(notificationRoutes);
app.use(studioRoutes);
app.use(apiRoutes);
app.use(playlistRoutes);
app.use(adminRoutes);

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
