const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.getLogin = (req, res) => {
    res.render('login', { user: req.session.user, error: null });
};

exports.getRegister = (req, res) => {
    res.render('register', { user: req.session.user, error: null });
};

exports.postRegister = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.render('register', { user: req.session.user, error: 'Bu e-posta ile kayıtlı bir kullanıcı zaten var.' });
        }
        user = new User({ username, email, password });
        await user.save();
        req.session.user = user;
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.render('register', { user: null, error: 'Server error' });
    }
};

exports.postLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.render('login', { user: null, error: 'Geçersiz e-posta veya şifre.' });
        }
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.render('login', { user: req.session.user, error: 'Geçersiz e-posta veya şifre.' });
        }

        if (user.isBanned) {
            return res.render('login', { user: req.session.user, error: `Yasaklandınız! Neden: ${user.banReason || 'Bilinmiyor'}` });
        }
        req.session.user = user;
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.render('login', { user: null, error: 'Server error' });
    }
};

exports.logout = (req, res) => {
    req.session.destroy(err => {
        if (err) console.log(err);
        res.redirect('/');
    });
};

