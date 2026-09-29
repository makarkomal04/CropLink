const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    orderItems: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Product'
        },
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        price: { type: Number, required: true },
        farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }],
    shippingAddress: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, required: true }
    },
    paymentMethod: {
        type: String,
        required: true,
        default: 'Cash on Delivery' // Simple start
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    isPaid: {
        type: Boolean,
        required: true,
        default: false
    },
    paidAt: {
        type: Date
    },
    status: {
        type: String,
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending'
    },
    warehouseStatus: {
        type: String,
        enum: ['Pending Inspection', 'Quality Passed', 'Quality Failed', 'Ready to Ship', 'Shipped'],
        default: 'Pending Inspection'
    },
    qualityNotes: {
        type: String,
        default: ''
    },
    rejectionReason: {
        type: String,
        default: ''
    },
    isDelivered: {
        type: Boolean,
        required: true,
        default: false
    },
    deliveredAt: {
        type: Date
    },
    // Delivery assignment
    assignedDeliveryBoy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    shippedAt: {
        type: Date
    },
    // Blockchain fields
    blockchainTxHash: {
        type: String
    },
    blockchainOrderId: {
        type: String
    },
    onBlockchain: {
        type: Boolean,
        default: false
    },
    blockchainStatus: {
        type: String
    },
    paymentTxHash: {
        type: String
    },
    completionTxHash: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
