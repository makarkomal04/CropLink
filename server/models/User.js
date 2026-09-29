const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Please add a password']
    },
    role: {
        type: String,
        enum: ['admin', 'farmer', 'customer', 'warehouse', 'shipment_manager', 'delivery_boy'],
        default: 'customer'
    },
    // For farmers
    farmLocation: {
        type: String
    },
    isVerified: { // Admin verification for farmers
        type: Boolean,
        default: false
    },
    // Blockchain wallet fields
    walletAddress: {
        type: String,
        unique: true,
        sparse: true
    },
    walletCreated: {
        type: Boolean,
        default: false
    },
    privateKeyEncrypted: {
        type: String, // Encrypted private key for backend-managed wallets
        select: false // Don't include in queries by default
    },
    walletMnemonic: {
        type: String, // Encrypted mnemonic phrase
        select: false
    },
    qrCodePath: { // QR code image path
        type: String,
        required: false
    },
    address: {
        type: String,
        required: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
