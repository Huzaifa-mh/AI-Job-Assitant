const express = require('express');
const router = express.Router();
const upload = require('../Middleware/resumeUploadMiddleware');
const { protect } = require('../Middleware/authMiddleware');
const {
    uploadResume,
    getResumeStatus,
    getMyResumes,
    activateResume,
    deleteResume,
} = require('../Controller/resumeUploadController');

router.post('/upload', protect, upload.single('resume'), uploadResume);
router.get('/', protect, getMyResumes);
router.get('/my', protect, getMyResumes);
router.get('/status/:resume_id', protect, getResumeStatus);
router.patch('/:id/activate', protect, activateResume);
router.delete('/:id', protect, deleteResume);

module.exports = router;