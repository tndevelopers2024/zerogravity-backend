const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    items: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
            name: String,
            image: String,
            quantity: Number,
            price: Number,

            // Frame
            selectedSize: { name: String, price: Number },

            // Digital
            selectedFormat: String,
            downloadLink: String,

            // Custom frame images
            customizationImages: [String],

            // E-Album Advanced Customization
            ealbumCustomization: {
                coverDesign: {
                    title: String,
                    template: String,  // 'template1', 'template2', 'template3'
                    font: String,      // 'whimsical', 'vintage', 'enchanted'
                    date: Date,
                    color: String      // color name or hex
                },
                pages: [{
                    pageNumber: Number,
                    images: [String],  // URLs of images for this page
                    layout: String     // 'single', 'double', 'grid'
                }]
            },

            subtotal: Number
        }
    ],

    totalAmount: { type: Number, required: true },

    deliveryAddress: {
        name: String,
        phone: String,
        address: String,
        city: String,
        state: String,
        pincode: String,
        country: { type: String, default: "India" }
    },

    paymentMethod: {
        type: String,
        enum: ["cod", "card", "upi", "netbanking"],
        default: "cod"
    },

    paymentStatus: {
        type: String,
        enum: ["pending", "completed", "failed", "refunded"],
        default: "pending"
    },

    status: {
        type: String,
        enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
        default: "pending"
    },

    trackingNumber: String,
    notes: String,

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

orderSchema.pre("save", function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model("Order", orderSchema);
