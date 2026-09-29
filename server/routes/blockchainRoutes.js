const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    createWallet,
    getWalletInfo,
    verifyProduct
} = require('../controllers/blockchainController');

// Wallet management routes
router.post('/wallet/create', protect, createWallet);
router.get('/wallet/:userId', protect, getWalletInfo);

// Public routes
router.post('/verify-product', verifyProduct);

module.exports = router;
