// controllers/downloadController.js
const Download = require("../models/Download");

exports.getDownloadLink = async (req, res) => {
    try {
        const { orderId, productId } = req.params;

        const license = await Download.findOne({
            user: req.user._id,
            orderId,
            product: productId
        });

        if (!license) {
            return res.status(404).json({ message: "No download found for this product" });
        }

        if (license.maxDownloads && license.downloads >= license.maxDownloads) {
            return res.status(403).json({ message: "Download limit reached" });
        }

        license.downloads += 1;
        license.lastDownloadedAt = new Date();
        await license.save();

        return res.json({ downloadUrl: license.downloadUrl });
    } catch (error) {
        console.error("Get download link error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};
