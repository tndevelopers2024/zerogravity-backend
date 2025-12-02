const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const sendEmail = require("../utils/sendEmail");
const generateOtp = require("../utils/generateOtp");
const jwt = require("jsonwebtoken");

// -------------------------
// CHECK USER EXISTENCE
// -------------------------
exports.checkUser = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        return res.json({ exists: !!user });
    } catch (error) {
        console.error("Check user error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// -------------------------
// SEND OTP FOR NEW USER (EMAIL VERIFICATION)
// -------------------------
exports.sendRegisterOtp = async (req, res) => {
    try {
        const { email } = req.body;

        const exists = await User.findOne({ email });
        if (exists) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const otp = generateOtp();

        // We can store this OTP temporarily in a separate collection or use a signed token approach.
        // For simplicity/statelessness without Redis, we can hash the OTP and send it back signed, 
        // OR just store it in a temporary "PendingRegistration" model.
        // BUT, since the existing code used User model for login OTP, let's use a lightweight approach:
        // We will return a signed token containing the hash of the OTP and the email.

        // Actually, to keep it secure and simple without a new model, let's just send the OTP. 
        // The verification step will need to trust the client to send back the email + otp, 
        // but we need to verify it against something.
        // Let's use a temporary "PendingUser" or just a signed JWT that contains the OTP hash.

        // BETTER APPROACH for this codebase: 
        // Create a temporary token containing { email, otpHash, expiresAt }
        // When verifying, we check this token.

        const otpHash = await bcrypt.hash(otp, 10);
        const tempToken = jwt.sign({ email, otpHash }, process.env.JWT_SECRET, { expiresIn: '10m' });

        await sendEmail(
            email,
            "Verify your Email",
            `<h2>Your Verification OTP is: <b>${otp}</b></h2><p>Expires in 10 minutes.</p>`
        );

        return res.json({
            message: "OTP sent to email",
            tempToken // Send this back to client to send in verify step
        });

    } catch (error) {
        console.error("Register OTP error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// -------------------------
// VERIFY EMAIL OTP (STEP 1 of Register)
// -------------------------
exports.verifyEmailOtp = async (req, res) => {
    try {
        const { email, otp, tempToken } = req.body;

        if (!tempToken) return res.status(400).json({ message: "Session expired, please resend OTP" });

        const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);

        if (decoded.email !== email) return res.status(400).json({ message: "Email mismatch" });

        const isMatch = await bcrypt.compare(otp, decoded.otpHash);
        if (!isMatch) return res.status(400).json({ message: "Invalid OTP" });

        // OTP Verified. Return a new token that authorizes "Registration Completion" for this email
        const registrationToken = jwt.sign({ email, isVerified: true }, process.env.JWT_SECRET, { expiresIn: '15m' });

        return res.json({
            success: true,
            message: "Email verified",
            registrationToken
        });

    } catch (error) {
        console.error("Verify Email OTP error:", error);
        return res.status(400).json({ message: "Invalid or expired session" });
    }
};

// -------------------------
// COMPLETE REGISTRATION (STEP 2)
// -------------------------
exports.completeRegistration = async (req, res) => {
    try {
        const { firstName, lastName, username, phone, password, registrationToken } = req.body;

        if (!registrationToken) return res.status(400).json({ message: "Registration session expired" });

        const decoded = jwt.verify(registrationToken, process.env.JWT_SECRET);
        if (!decoded.isVerified || !decoded.email) return res.status(400).json({ message: "Invalid registration session" });

        const email = decoded.email;

        // Double check existence
        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            firstName,
            lastName,
            username,
            email,
            phone,
            password: hashedPassword,
            isVerified: true
        });

        return res.status(201).json({
            message: "User registered successfully",
            user,
            token: generateToken(user)
        });

    } catch (error) {
        console.error("Complete Registration error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// -------------------------
// SEND OTP FOR REGISTER
// -------------------------


// -------------------------
// VERIFY OTP AND REGISTER USER
// -------------------------


// -------------------------
// SEND OTP FOR LOGIN
// -------------------------
exports.sendLoginOtp = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not found" });

        const otp = generateOtp();

        user.otp = otp;
        user.otpExpires = Date.now() + 5 * 60 * 1000; // 5 min expiry
        await user.save();

        await sendEmail(
            email,
            "Your Login OTP",
            `<h2>Your OTP is: <b>${otp}</b></h2>`
        );

        return res.json({ message: "OTP sent to email" });

    } catch (err) {
        console.error("Login OTP error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// -------------------------
// VERIFY LOGIN OTP
// -------------------------
exports.verifyLoginOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not found" });

        if (user.otp !== otp || Date.now() > user.otpExpires) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        // clear OTP
        user.otp = null;
        user.otpExpires = null;
        await user.save();

        return res.json({
            message: "Login successful",
            user,
            token: generateToken(user)
        });

    } catch (error) {
        console.error("Verify Login OTP error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// -------------------------
// ADMIN LOGIN (PASSWORD BASED)
// -------------------------
exports.adminLogin = async (req, res) => {
    try {
        let { emailOrUsername, password, username, email } = req.body;

        // Allow username or email fields if emailOrUsername is not provided
        emailOrUsername = emailOrUsername || username || email;

        if (!emailOrUsername) {
            return res.status(400).json({ message: "Username or Email is required" });
        }

        // Find user by email OR username
        const user = await User.findOne({
            $or: [{ email: emailOrUsername }, { username: emailOrUsername }]
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid credentials (User not found)" });
        }

        // Check if admin
        if (user.role !== "admin") {
            return res.status(403).json({ message: "Access denied. Admin only." });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials (Password mismatch)" });
        }

        return res.json({
            message: "Admin login successful",
            user,
            token: generateToken(user)
        });

    } catch (error) {
        console.error("Admin login error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        return res.json(user);
    } catch (error) {
        console.error("Get me error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};