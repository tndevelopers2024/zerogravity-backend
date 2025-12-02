require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

// -------------------------------------
// IMPORT ROUTES (match your folder names)
// -------------------------------------
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const cartRoutes = require("./routes/cartRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const downloadRoutes = require("./routes/downloadRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const uploadRoutes = require('./routes/uploadUser');

const app = express();
const PORT = process.env.PORT || 5000;

// ---------------------------
// CORS CONFIG
// ---------------------------
app.use(
  cors({
    origin: [
      "http://localhost:5175",
      "http://localhost:5174",
      "http://localhost:5173",
      "https://zerogravity-frontend-peach.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ---------------------------
// Middleware
// ---------------------------
app.use(express.json());

// ---------------------------
// MongoDB Connection
// ---------------------------
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
  }
};

connectDB();

// ---------------------------
// API ROUTES
// ---------------------------
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/downloads", downloadRoutes);
app.use("/api/categories", categoryRoutes);
app.use('/api/upload', uploadRoutes);

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ---------------------------
// Health Route
// ---------------------------
app.get("/", (req, res) => {
  res.send("Zero Gravity API is running");
});

// ---------------------------
// Export (Vercel)
// ---------------------------
module.exports = app;

// LOCAL server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running locally on http://localhost:${PORT}`);
  });
}
