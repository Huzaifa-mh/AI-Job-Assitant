const express = require('express');
const router  = express.Router();
const {
  matchSingleJob,
  matchAllJobs,
  getMatchResults,
  getTopMatches,
} = require('../Controller/matchController');
const { protect } = require('../middleware/authMiddleware');

router.post('/job',     protect, matchSingleJob);
router.post('/all',     protect, matchAllJobs);
router.get('/results',  protect, getMatchResults);
router.get('/top',      protect, getTopMatches);

module.exports = router;