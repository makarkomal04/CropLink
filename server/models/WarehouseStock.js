const mongoose = require('mongoose');

const warehouseStockSchema = mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Product'
    },
    currentStock: {
        type: Number,
        required: true,
        default: 0
    },
    lowStockThreshold: {
        type: Number,
        required: true,
        default: 10 // Alert when below 10kg
    },
    location: { // Warehouse Section/Rack
        type: String,
        required: false
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('WarehouseStock', warehouseStockSchema);
