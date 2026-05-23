const express = require('express');
const router = express.Router();

const {
    fetchAndStoreJobs,
    getAllJobs,
    getJobById,
    clearOldJobs,
} = require('../Contoller/jobController');
const { protect } = require('../Middleware/authMiddleware');

router.post('/fetch', protect, fetchAndStoreJobs);
router.get('/', protect, getAllJobs);
router.get('/:jobId', protect, getJobById);
router.delete('/clear', protect, clearOldJobs);

module.exports = router;

