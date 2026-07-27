const express = require('express');
const router  = express.Router();
const { chatWithAthena } = require('../Controller/athenaController');
const { protect } = require('../Middleware/authMiddleware');

router.post('/chat', protect, chatWithAthena);

module.exports = router;
