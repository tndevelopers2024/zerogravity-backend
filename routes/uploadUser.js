const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 10000);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

router.post("/image", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  res.json({
    message: "Uploaded",
    url: `${process.env.SERVER_URL || "https://mitoslearning.co.in"}/uploads/${req.file.filename}`,
  });
});

module.exports = router;
