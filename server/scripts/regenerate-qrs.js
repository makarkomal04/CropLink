const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const QRCode = require('qrcode');
const Product = require('../models/Product');

// Load environment variables
dotenv.config();

const regenerateQRs = async () => {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to database.');

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        console.log(`Using FRONTEND_URL: ${frontendUrl}`);

        const products = await Product.find({});
        console.log(`Found ${products.length} products to process.`);

        const qrDir = process.env.VERCEL ? '/tmp/qr-codes/' : path.join(__dirname, '../uploads/qr-codes/products');

        if (!fs.existsSync(qrDir)) {
            fs.mkdirSync(qrDir, { recursive: true });
        }

        for (const product of products) {
            const qrUrl = `${frontendUrl}/verify/${product._id}`;
            const filename = `product-${product._id}.png`;
            const filepath = path.join(qrDir, filename);
            const qrCodePathStatic = `/uploads/qr-codes/products/${filename}`;

            console.log(`Generating QR for product: ${product.name} (${product._id}) -> ${qrUrl}`);

            await QRCode.toFile(filepath, qrUrl, {
                width: 500,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            });

            product.qrCodePath = qrCodePathStatic;
            await product.save();
        }

        console.log('Successfully regenerated all QR codes!');
        process.exit(0);
    } catch (error) {
        console.error('Error regenerating QR codes:', error);
        process.exit(1);
    }
};

regenerateQRs();