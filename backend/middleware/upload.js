const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.memoryStorage();

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|heic|heif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, webp, heic) are allowed'));
  }
};

// ✅ Configuration for ARTICLES (single image)
const uploadSingleConfig = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Only 1 image for cover
  },
  fileFilter: fileFilter
});

// ✅ Configuration for PROPERTIES (multiple images)
const uploadMultipleConfig = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 10 // Allow up to 10 files for properties
  },
  fileFilter: fileFilter
});

// Middleware for multiple image upload (properties)
const uploadImages = uploadMultipleConfig.array('images', 10);

// Middleware for single image upload (articles)
const uploadSingle = uploadSingleConfig.single('image');

module.exports = { uploadImages, uploadSingle };