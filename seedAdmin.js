const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const username = 'admin';
        const password = '123456'; // Default password
        const email = 'admin@zerogravity.com';

        let user = await User.findOne({ username });

        if (user) {
            console.log('Admin user found. Updating password...');
            user.password = await bcrypt.hash(password, 10);
            user.role = 'admin';
            user.email = email; // Ensure email is set
            await user.save();
            console.log('Admin password updated to: 123456');
        } else {
            console.log('Admin user not found. Creating...');
            const hashedPassword = await bcrypt.hash(password, 10);
            user = await User.create({
                firstName: 'Admin',
                lastName: 'User',
                username,
                email,
                password: hashedPassword,
                role: 'admin',
                phone: '0000000000',
                isVerified: true
            });
            console.log('Admin user created with password: 123456');
        }

        process.exit();
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
