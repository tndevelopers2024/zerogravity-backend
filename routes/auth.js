const express = require('express');
const router = express.Router();
const User = require('../models/User');


const sendEmail = require('../utils/emailService');

// Register User
router.post('/register', async (req, res) => {
    try {
        const { name, email, phone, businessName, gstNo, username, password } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create User
        const newUser = new User({
            name, email, phone, businessName, gstNo, username, password
        });
        await newUser.save();

        // Notify Admin (Mock)
        await sendEmail('admin@zerogravity.com', 'New User Registration', `User ${name} (${businessName}) has registered.`);

        // Notify User
        await sendEmail(email, 'Registration Received', 'Your registration is pending approval.');

        res.status(201).json({ message: 'Registration successful. Please wait for admin approval.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Login User
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password (In production, use bcrypt to compare hashes)
        if (user.password !== password) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check status
        if (user.status !== 'approved' && user.role !== 'admin') {
            return res.status(403).json({ message: 'Account not approved yet' });
        }

        res.json({
            message: 'Login successful',
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get All Users (Admin)
router.get('/users', async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Verify User (Admin)
router.post('/verify', async (req, res) => {
    try {
        const { userId, action } = req.body; // action: 'approve' or 'reject'

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (action === 'approve') {
            user.status = 'approved';
            await sendEmail(user.email, 'Welcome to Zero Gravity', `Your account has been approved! Username: ${user.username}`);
        } else if (action === 'reject') {
            user.status = 'rejected';
            await sendEmail(user.email, 'Registration Rejected', 'Your registration has been rejected.');
        } else {
            return res.status(400).json({ message: 'Invalid action' });
        }

        await user.save();
        res.json({ message: `User ${action}d successfully`, user });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get Single User by ID (Admin)
router.get('/users/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete User (Admin)
router.delete('/users/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findByIdAndDelete(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
