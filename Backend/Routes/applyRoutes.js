const express = require('express');
const router = express.Router();
const { protect } = require('../Middleware/authMiddleware');
const { scanJobForm, mapFormFields, fillForm } = require('../Controller/applyController');

router.post('/scan',       protect, scanJobForm);
router.post('/map-fields', protect, mapFormFields);
router.post('/fill',       protect, fillForm);       // ← new

module.exports = router;