const express = require('express');
const {
  getProperties,
  getPropertyBySlug,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty
} = require('../controllers/properties');
const { verifyToken, isAdmin } = require('../middleware/auth');
const { uploadImages } = require('../middleware/upload');

const router = express.Router();

// PUBLIC ROUTES
router.get('/', getProperties);
router.get('/id/:id', getPropertyById);
router.get('/slug/:slug', getPropertyBySlug);

// ADMIN ROUTES
router.post('/', verifyToken, isAdmin, uploadImages, createProperty);
router.put('/:id', verifyToken, isAdmin, uploadImages, updateProperty);
router.delete('/:id', verifyToken, isAdmin, deleteProperty);

module.exports = router;