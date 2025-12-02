const multer = require("multer");
const fs = require("fs");
const path = require("path");

function ensureFolder(folderPath) {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadType = req.params.type; // "frame" or "ealbum"

    let folder = "uploads/user";

    if (uploadType === "frame") folder = "uploads/frames";
    if (uploadType === "ealbum") folder = "uploads/ealbums";

    const fullPath = path.join(__dirname, "..", folder);
    ensureFolder(fullPath);

    cb(null, fullPath);
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_"));
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpg", "image/jpeg", "image/png", "image/webp"];

  if (!allowed.includes(file.mimetype)) {
    return cb(new Error("Only JPG, PNG, WEBP images allowed"), false);
  }
  cb(null, true);
};

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});
