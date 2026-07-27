const express = require('express');
const router  = express.Router();
const {
  generateProposal,
  saveProposal,
  getMyProposals,
} = require('../Controller/proposalController');
const { protect } = require('../Middleware/authMiddleware');

router.post('/generate', protect, generateProposal);
router.post('/',         protect, saveProposal);
router.get('/',          protect, getMyProposals);

module.exports = router;
