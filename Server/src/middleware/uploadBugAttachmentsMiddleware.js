const multer = require("multer");
const path = require("path");
const fs = require("fs");

const screenshotDir = path.join(__dirname, "..", "uploads", "screenshots");
const issueVideoDir = path.join(__dirname, "..", "uploads", "issue-videos");

[screenshotDir, issueVideoDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = file.fieldname === "issueVideo" ? issueVideoDir : screenshotDir;
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === "screenshot") {
    if (ACCEPTED_IMAGE_TYPES.includes(file.mimetype)) {
      return cb(null, true);
    }
    return cb(new Error("Screenshot must be PNG, JPG or WEBP"), false);
  }

  if (file.fieldname === "issueVideo") {
    if (ACCEPTED_VIDEO_TYPES.includes(file.mimetype)) {
      return cb(null, true);
    }
    return cb(new Error("Video must be MP4, WEBM or MOV"), false);
  }

  cb(new Error("Unexpected field"), false);
};

const uploadBugAttachments = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB ceiling (screenshot is validated to 5MB on the frontend)
});

module.exports = uploadBugAttachments;