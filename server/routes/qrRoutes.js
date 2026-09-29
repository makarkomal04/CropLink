const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    generateProductQR,
    generateFarmerQR,
    getProductInfo,
    getFarmerInfo,
    getWalletInfo
} = require('../controllers/qrController');

// Protected routes - require authentication
router.post('/product/:id', protect, generateProductQR);
router.post('/farmer/:id', protect, generateFarmerQR);

// Public routes - no authentication required
router.get('/product-info/:id', getProductInfo);
router.get('/farmer-info/:id', getFarmerInfo);
router.get('/wallet-info/:id', getWalletInfo);

module.exports = router;
