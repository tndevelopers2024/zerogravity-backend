const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },

    isVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpires: { type: Date },

    address: {
        street: String,
        city: String,
        state: String,
        pincode: String,
        country: { type: String, default: "India" }
    },

    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],

    role: { type: String, enum: ["user", "admin"], default: "user" },

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", userSchema);
