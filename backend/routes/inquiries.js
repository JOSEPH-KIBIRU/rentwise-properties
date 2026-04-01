const express = require('express');
const {
  createInquiry,
  getInquiries,
  updateInquiry
} = require('../controllers/inquiries');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/', createInquiry);

// Protected routes (agents/admins only)
router.get('/', verifyToken, getInquiries);
router.patch('/:id', verifyToken, updateInquiry);

module.exports = router;