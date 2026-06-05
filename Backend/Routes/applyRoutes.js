const express = require('express');
const router  = express.Router();
const { scanJobForm, mapFormFields } = require('../Controllers/applyController');
const { protect } = require('../Middleware/authMiddleware');

router.post('/scan',       protect, scanJobForm);    // Step 1: scan form
router.post('/map-fields', protect, mapFormFields);  // Step 2: AI fill

module.exports = router;