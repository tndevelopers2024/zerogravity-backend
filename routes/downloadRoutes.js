// routes/downloadRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getDownloadLink } = require("../controllers/downloadController");

// /api/downloads/order/:orderId/product/:productId
router.get("/order/:orderId/product/:productId", protect, getDownloadLink);

module.exports = router;
