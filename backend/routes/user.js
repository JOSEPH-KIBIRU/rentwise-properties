const express = require('express');
const { getProfile, updateProfile } = require('../controllers/user');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);

module.exports = router;