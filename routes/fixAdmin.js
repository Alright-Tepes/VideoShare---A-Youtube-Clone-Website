require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const usernameToMakeAdmin = 'erdem123';

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('MongoDB Connected');

        const result = await User.collection.updateOne(
            { username: usernameToMakeAdmin },
            { $set: { isAdmin: true } }
        );

        console.log('Update result:', result);


        const updatedUser = await User.findOne({ username: usernameToMakeAdmin });
        console.log('Updated User Status:', updatedUser.username, 'isAdmin:', updatedUser.isAdmin);

        process.exit(0);
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
