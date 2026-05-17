const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../Controller/userController');
const { authenticateToken } = require('../Middleware/authMiddleware');

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

module.exports = router;