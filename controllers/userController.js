// controllers/userController.js
const User = require("../models/User");

exports.updateProfile = async (req, res) => {
    try {
        const { firstName, lastName, phone, address } = req.body;

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (firstName !== undefined) user.firstName = firstName;
        if (lastName !== undefined) user.lastName = lastName;
        if (phone !== undefined) user.phone = phone;
        if (address !== undefined) user.address = { ...user.address, ...address };

        await user.save();

        return res.json({
            message: "Profile updated",
            user: await User.findById(req.user._id).select("-password")
        });
    } catch (error) {
        console.error("Update profile error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

// Admin: Get all users
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password").sort({ createdAt: -1 });
        return res.json(users);
    } catch (error) {
        console.error("Get users error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

// Admin: Get single user
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });
        return res.json(user);
    } catch (error) {
        console.error("Get user error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

// Admin: Delete user
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        await user.deleteOne();
        return res.json({ message: "User deleted" });
    } catch (error) {
        console.error("Delete user error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};
