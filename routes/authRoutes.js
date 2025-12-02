const express = require("express");
const router = express.Router();

const {
    checkUser,
    sendRegisterOtp,
    verifyEmailOtp,
    completeRegistration,
    sendLoginOtp,
    verifyLoginOtp,
    adminLogin,
    getMe
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");


// ---------------- ROUTES ----------------

// Check User
router.post("/check-user", checkUser);

// Register Flow
router.post("/send-register-otp", sendRegisterOtp);
router.post("/verify-email-otp", verifyEmailOtp);
router.post("/complete-registration", completeRegistration);

// Login OTP
router.post("/send-login-otp", sendLoginOtp);

// Verify Login OTP
router.post("/verify-login-otp", verifyLoginOtp);

// Admin Login
router.post("/admin-login", adminLogin);

// Get Current User
router.get("/me", protect, getMe);



module.exports = router;
