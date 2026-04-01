const multer = require('multer');
const path = require('path');

// Configure multer for memory storage
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

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for articles
    files: 1 // Only 1 image for cover
  },
  fileFilter: fileFilter
});

// Middleware for multiple image upload (properties)
const uploadImages = upload.array('images', 10);

// Middleware for single image upload (articles)
const uploadSingle = upload.single('image');  // Field name is 'image'

module.exports = { uploadImages, uploadSingle };