// controllers/reviewController.js
const Review = require("../models/review");

exports.addReview = async (req, res) => {
    try {
        const { productId, rating, review } = req.body;

        const existing = await Review.findOne({
            product: productId,
            user: req.user._id
        });

        if (existing) {
            existing.rating = rating;
            existing.review = review;
            await existing.save();
            return res.json({ message: "Review updated", review: existing });
        }

        const newReview = await Review.create({
            product: productId,
            user: req.user._id,
            rating,
            review
        });

        return res.status(201).json({ message: "Review added", review: newReview });
    } catch (error) {
        console.error("Add review error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

exports.getProductReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ product: req.params.productId })
            .populate("user", "firstName lastName");
        return res.json(reviews);
    } catch (error) {
        console.error("Get reviews error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

exports.deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) return res.status(404).json({ message: "Review not found" });

        if (
            review.user.toString() !== req.user._id.toString() &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({ message: "Not authorized to delete" });
        }

        await review.deleteOne();
        return res.json({ message: "Review deleted" });
    } catch (error) {
        console.error("Delete review error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};
