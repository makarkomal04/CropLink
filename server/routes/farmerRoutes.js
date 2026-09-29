const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getFarmerRevenue } = require('../controllers/farmerController');

// @route   GET /api/farmers/revenue
// @desc    Get farmer revenue statistics
// @access  Private/Farmer
router.get('/revenue', protect, authorize('farmer'), getFarmerRevenue);

module.exports = router;
