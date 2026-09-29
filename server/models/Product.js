const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    farmer: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    name: {
        type: String,
        required: [true, 'Please add a product name']
    },
    category: {
        type: String,
        required: [true, 'Please add a category (e.g., Vegetables, Fruits)'],
        enum: ['Vegetables', 'Fruits', 'Grains', 'Others'] // Can be expanded
    },
    type: { // Organic or Pesticide-free
        type: String,
        required: [true, 'Please select product type'],
        enum: ['Organic', 'Pesticide-free', 'Conventional']
    },
    quantity: {
        type: Number,
        required: [true, 'Please add quantity in kg'],
        default: 0
    },
    pricePerKg: {
        type: Number,
        required: [true, 'Please add price per kg'],
        default: 0.0
    },
    description: {
        type: String,
        required: false
    },
    images: [{
        type: String // URL/Path to image
    }],
    isApproved: { // Admin approval
        type: Boolean,
        default: false 
    },
    qrCodePath: { // QR code image path
        type: String,
        required: false
    },
    harvestDate: {
        type: Date,
        required: false
    },
    expiryDate: {
        type: Date,
        required: false
    },
    batchNumber: {
        type: String,
        required: false
    },
    farmerLocation: {
        type: String,
        required: false 
    },
    blockchainId: {
        type: String, 
        required: false
    }
}, {
    timestamps: true
});

// Pre-validation hook to normalize enums (case-insensitive)
productSchema.pre('validate', async function() {
    if (this.type) {
        const typeEnum = ['Organic', 'Pesticide-free', 'Conventional'];
        const match = typeEnum.find(v => v.toLowerCase() === this.type.toLowerCase());
        if (match) this.type = match;
    }
    if (this.category) {
        const catEnum = ['Vegetables', 'Fruits', 'Grains', 'Others'];
        const match = catEnum.find(v => v.toLowerCase() === this.category.toLowerCase());
        if (match) this.category = match;
    }
});

module.exports = mongoose.model('Product', productSchema);
