const mongoose = require("mongoose");

const downloadSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    downloadUrl: String,
    downloads: { type: Number, default: 0 },
    maxDownloads: { type: Number, default: 5 },
    lastDownloadedAt: Date
});

module.exports = mongoose.model("Download", downloadSchema);
