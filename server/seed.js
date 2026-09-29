const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Admin user data
const adminData = {
    name: 'Admin',
    email: 'admin@croplink.com',
    password: 'admin123', // Will be hashed
    role: 'admin',
    isVerified: true
};

// Sample farmer for testing
const farmerData = {
    name: 'Test Farmer',
    email: 'farmer@test.com',
    password: 'farmer123',
    role: 'farmer',
    farmLocation: 'Pune, Maharashtra',
    isVerified: true
};

// Sample customer for testing
const customerData = {
    name: 'Test Customer',
    email: 'customer@test.com',
    password: 'customer123',
    role: 'customer',
    isVerified: true
};

// Warehouse staff
const warehouseData = {
    name: 'Warehouse Staff',
    email: 'warehouse@croplink.com',
    password: 'warehouse123',
    role: 'warehouse',
    isVerified: true
};

// Shipment manager
const shipmentManagerData = {
    name: 'Shipment Manager',
    email: 'shipment@croplink.com',
    password: 'shipment123',
    role: 'shipment_manager',
    isVerified: true
};

// Delivery boys
const deliveryBoy1Data = {
    name: 'Delivery Boy 1',
    email: 'delivery1@croplink.com',
    password: 'delivery123',
    role: 'delivery_boy',
    isVerified: true
};

const deliveryBoy2Data = {
    name: 'Delivery Boy 2',
    email: 'delivery2@croplink.com',
    password: 'delivery123',
    role: 'delivery_boy',
    isVerified: true
};

const seedDatabase = async () => {
    try {
        // Connect to database
        await connectDB();

        console.log('🌱 Starting database seeding...\n');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: adminData.email });
        if (existingAdmin) {
            console.log('⚠️  Admin user already exists!');
            console.log(`   Email: ${adminData.email}`);
            console.log(`   You can login with: admin@croplink.com / admin123\n`);
        } else {
            // Hash password and create admin
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(adminData.password, salt);
            
            await User.create({
                ...adminData,
                password: hashedPassword
            });
            
            console.log('✅ Admin user created successfully!');
            console.log(`   Email: ${adminData.email}`);
            console.log(`   Password: ${adminData.password}\n`);
        }

        // Create farmer if doesn't exist
        const existingFarmer = await User.findOne({ email: farmerData.email });
        if (!existingFarmer) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(farmerData.password, salt);
            
            await User.create({
                ...farmerData,
                password: hashedPassword
            });
            
            console.log('✅ Farmer user created successfully!');
            console.log(`   Email: ${farmerData.email}`);
            console.log(`   Password: ${farmerData.password}\n`);
        } else {
            console.log('⚠️  Farmer user already exists!\n');
        }

        // Create customer if doesn't exist
        const existingCustomer = await User.findOne({ email: customerData.email });
        if (!existingCustomer) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(customerData.password, salt);
            
            await User.create({
                ...customerData,
                password: hashedPassword
            });
            
            console.log('✅ Customer user created successfully!');
            console.log(`   Email: ${customerData.email}`);
            console.log(`   Password: ${customerData.password}\n`);
        } else {
            console.log('⚠️  Customer user already exists!\n');
        }

        // ── Warehouse Staff ──────────────────────────────────
        const existingWarehouse = await User.findOne({ email: warehouseData.email });
        if (!existingWarehouse) {
            const salt = await bcrypt.genSalt(10);
            await User.create({ ...warehouseData, password: await bcrypt.hash(warehouseData.password, salt) });
            console.log('✅ Warehouse user created!');
            console.log(`   Email: ${warehouseData.email} / ${warehouseData.password}\n`);
        } else {
            console.log('⚠️  Warehouse user already exists!\n');
        }

        // ── Shipment Manager ─────────────────────────────────
        const existingShipment = await User.findOne({ email: shipmentManagerData.email });
        if (!existingShipment) {
            const salt = await bcrypt.genSalt(10);
            await User.create({ ...shipmentManagerData, password: await bcrypt.hash(shipmentManagerData.password, salt) });
            console.log('✅ Shipment Manager created!');
            console.log(`   Email: ${shipmentManagerData.email} / ${shipmentManagerData.password}\n`);
        } else {
            console.log('⚠️  Shipment Manager already exists!\n');
        }

        // ── Delivery Boy 1 ───────────────────────────────────
        const existingDB1 = await User.findOne({ email: deliveryBoy1Data.email });
        if (!existingDB1) {
            const salt = await bcrypt.genSalt(10);
            await User.create({ ...deliveryBoy1Data, password: await bcrypt.hash(deliveryBoy1Data.password, salt) });
            console.log('✅ Delivery Boy 1 created!');
            console.log(`   Email: ${deliveryBoy1Data.email} / ${deliveryBoy1Data.password}\n`);
        } else {
            console.log('⚠️  Delivery Boy 1 already exists!\n');
        }

        // ── Delivery Boy 2 ───────────────────────────────────
        const existingDB2 = await User.findOne({ email: deliveryBoy2Data.email });
        if (!existingDB2) {
            const salt = await bcrypt.genSalt(10);
            await User.create({ ...deliveryBoy2Data, password: await bcrypt.hash(deliveryBoy2Data.password, salt) });
            console.log('✅ Delivery Boy 2 created!');
            console.log(`   Email: ${deliveryBoy2Data.email} / ${deliveryBoy2Data.password}\n`);
        } else {
            console.log('⚠️  Delivery Boy 2 already exists!\n');
        }

        console.log('🎉 Database seeding completed!\n');
        console.log('📝 Test Accounts Summary:');
        console.log('   =====================================================');
        console.log('   Admin:            admin@croplink.com    / admin123');
        console.log('   Farmer:           farmer@test.com       / farmer123');
        console.log('   Customer:         customer@test.com     / customer123');
        console.log('   Warehouse:        warehouse@croplink.com/ warehouse123');
        console.log('   Shipment Manager: shipment@croplink.com / shipment123');
        console.log('   Delivery Boy 1:   delivery1@croplink.com/ delivery123');
        console.log('   Delivery Boy 2:   delivery2@croplink.com/ delivery123');
        console.log('   =====================================================\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error.message);
        process.exit(1);
    }
};

// Run the seeder
seedDatabase();
