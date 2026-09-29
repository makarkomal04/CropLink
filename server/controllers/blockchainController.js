const blockchainService = require('../services/BlockchainService');
const User = require('../models/User');

/**
 * @desc    Create wallet for user
 * @route   POST /api/blockchain/wallet/create
 * @access  Private
 */
const createWallet = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        if (user.walletAddress) {
            return res.status(400).json({ message: 'Wallet already exists for this user' });
        }
        
        // Generate new wallet
        const wallet = blockchainService.generateWallet();
        
        // Encrypt and save private key
        const encryptedPrivateKey = blockchainService.encryptPrivateKey(wallet.privateKey);
        const encryptedMnemonic = blockchainService.encryptPrivateKey(wallet.mnemonic);
        
        user.walletAddress = wallet.address;
        user.walletCreated = true;
        user.privateKeyEncrypted = encryptedPrivateKey;
        user.walletMnemonic = encryptedMnemonic;
        
        await user.save();
        
        res.json({
            message: 'Wallet created successfully',
            walletAddress: wallet.address,
            mnemonic: wallet.mnemonic // Send once for user to backup
        });
    } catch (error) {
        console.error('Create wallet error:', error);
        res.status(500).json({ message: 'Failed to create wallet', error: error.message });
    }
};

/**
 * @desc    Get wallet info
 * @route   GET /api/blockchain/wallet/:userId
 * @access  Private
 */
const getWalletInfo = async (req, res) => {
    try {
        const userId = req.params.userId === 'me' ? req.user._id : req.params.userId;
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        if (!user.walletAddress) {
            return res.status(404).json({ message: 'No wallet found for this user' });
        }
        
        res.json({
            walletAddress: user.walletAddress
        });
    } catch (error) {
        console.error('Get wallet info error:', error);
        res.status(500).json({ message: 'Failed to get wallet info', error: error.message });
    }
};

/**
 * @desc    Verify product authenticity
 * @route   POST /api/blockchain/verify-product
 * @access  Public
 */
const verifyProduct = async (req, res) => {
    try {
        let { batchId, productDetails } = req.body;
        
        // Fallback: If batchId is missing, try to use the productId from productDetails
        // Many products use their MongoDB ID as the Batch ID on blockchain
        if (!batchId && productDetails) {
            batchId = productDetails._id || productDetails.id;
        }
        
        if (!batchId || !productDetails) {
            return res.status(400).json({ message: 'Batch ID and product details are required' });
        }
        
        const result = await blockchainService.verifyProductOnBlockchain(batchId, productDetails);
        
        res.json(result);
    } catch (error) {
        console.error('Verify product error:', error);
        res.status(500).json({ message: 'Failed to verify product', error: error.message });
    }
};

module.exports = {
    createWallet,
    getWalletInfo,
    verifyProduct
};
