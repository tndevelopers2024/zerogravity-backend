// controllers/uploadUserController.js
exports.uploadUserFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const uploadType = req.params.type; // frame / ealbum / user

    const fileUrls = req.files.map((file) => {
      return `${process.env.SERVER_URL || "http://localhost:5000"}/uploads/${uploadType === "frame" 
        ? "frames" 
        : uploadType === "ealbum" 
        ? "ealbums" 
        : "user"
      }/${file.filename}`;
    });

    return res.status(200).json({
      message: "Files uploaded successfully",
      files: fileUrls,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
