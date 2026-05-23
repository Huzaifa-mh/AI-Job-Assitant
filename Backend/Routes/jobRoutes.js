const express = require('express');
const router  = express.Router();
const {
  fetchAndStoreJobs,
  getAllJobs,
  getJobById,
  clearOldJobs,
} = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');

router.post('/fetch',       protect, fetchAndStoreJobs);  // fetch from LinkedIn
router.get('/',             protect, getAllJobs);          // list all cached jobs
router.get('/:jobId',       protect, getJobById);         // single job detail
router.delete('/clear',     protect, clearOldJobs);       // clear old cache

module.exports = router;