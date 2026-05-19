const express = require('express');
const router = express.Router();
const upload = require('../Middleware/resumeUploadMiddleware');
const { protect } = require('../Middleware/authMiddleware');
const {
    uploadResume,
    getResumeStatus,
    getMyResume,
} = require('../Controller/resumeUploadController');

router.post('/upload', protect, upload.single('resume'), uploadResume);
router.get('/my', protect, getResumeStatus);
router.get('/status/:resume_id', protect, getMyResume);

module.exports = router;