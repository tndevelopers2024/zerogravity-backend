// routes/reviewRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
    addReview,
    getProductReviews,
    deleteReview
} = require("../controllers/reviewController");

// /api/reviews
router.post("/", protect, addReview);
router.get("/product/:productId", getProductReviews);
router.delete("/:id", protect, deleteReview);

module.exports = router;
