const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Order = require('./models/Order');

dotenv.config();

const migrateOrders = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/croplink');
        console.log('Connected to MongoDB');

        // Update all orders that don't have warehouse status
        const result = await Order.updateMany(
            { warehouseStatus: { $exists: false } },
            { 
                $set: { 
                    warehouseStatus: 'Pending Inspection',
                    qualityNotes: '',
                    rejectionReason: ''
                } 
            }
        );

        console.log(`✅ Updated ${result.modifiedCount} orders with warehouse status`);

        // Show current counts
        const pending = await Order.countDocuments({ warehouseStatus: 'Pending Inspection' });
        const passed = await Order.countDocuments({ warehouseStatus: 'Quality Passed' });
        const shipped = await Order.countDocuments({ warehouseStatus: 'Shipped' });

        console.log('\n📊 Warehouse Status Counts:');
        console.log(`   Pending Inspection: ${pending}`);
        console.log(`   Quality Passed: ${passed}`);
        console.log(`   Shipped: ${shipped}`);

        await mongoose.disconnect();
        console.log('\n✅ Migration complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration error:', error);
        process.exit(1);
    }
};

migrateOrders();
