module.exports = {
    ensureAuth: function (req, res, next) {
        if (req.session.user) {
            return next();
        }
        req.session.returnTo = req.originalUrl;
        res.redirect('/login');
    },
    ensureGuest: function (req, res, next) {
        if (req.session.user) {
            return res.redirect('/');
        }
        return next();
    },
    ensureAdmin: function (req, res, next) {
        const user = req.session.user;
        const isAdmin = user ? user.isAdmin : null;
        console.log(`[ensureAdmin] User: ${user ? user.username : 'Guest'}, isAdmin: ${isAdmin}, Type: ${typeof isAdmin}`);

        if (user && (isAdmin === true || isAdmin === 'true')) {
            return next();
        }
        console.log('[ensureAdmin] Access Denied - Redirecting to /');
        res.redirect('/');
    },
    checkBan: async function (req, res, next) {
        
        if (req.path === '/banned' || req.path === '/logout') return next();

        const User = require('../models/User');
        const ip = req.ip || req.connection.remoteAddress;

        
        if (req.session.user && req.session.user.isBanned) {
            console.log(`[checkBan] Blocking user ${req.session.user.username} (ID: ${req.session.user._id}) - isBanned is true`);
            return res.redirect('/banned');
        }

        
        const bannedUserByIp = await User.findOne({ bannedIps: ip, isBanned: true });
        if (bannedUserByIp) {
            console.log(`[checkBan] Blocking IP ${ip} - Found in bannedIps of user: ${bannedUserByIp.username} (ID: ${bannedUserByIp._id})`);
            return res.redirect('/banned');
        }

        next();
    }
};
