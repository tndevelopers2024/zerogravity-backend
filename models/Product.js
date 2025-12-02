const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ["frame", "ealbum"],
        required: true
    },

    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, default: "General" },

    coverImage: { type: String },
    gallery: [String],

    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },

    /* ========= FRAME FIELDS ========= */
    frameSizes: [
        {
            name: String, // 8x10, 12x18 etc
            price: Number,
            inStock: { type: Boolean, default: true }
        }
    ],
    frameMaterials: [String],
    frameColors: [String],

    /* ========= E-ALBUM FIELDS ========= */
    formats: [{ type: String, enum: ["PDF", "EPUB", "MOBI"] }],
    pageCount: Number,
    author: String,
    publisher: String,
    isbn: String,
    digitalDownloadUrl: String,
    isDigital: { type: Boolean, default: false },

    /* ========= ADDITIONAL ========= */
    features: [String],
    benefits: [String],

    /* ========= CUSTOMIZATION ========= */
    customization: {
        allowed: { type: Boolean, default: false },
        imageCount: { type: Number, default: 0 },
        previewArea: {
            x: { type: Number, default: 10 }, // % from left
            y: { type: Number, default: 10 }, // % from top
            width: { type: Number, default: 80 }, // % width
            height: { type: Number, default: 80 } // % height
        }
    },

    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Product", productSchema);
