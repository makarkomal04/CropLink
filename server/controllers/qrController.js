const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');
const Product = require('../models/Product');
const User = require('../models/User');

// Ensure QR directory exists
const qrDir = process.env.VERCEL ? '/tmp/qr-codes' : path.join(__dirname, '../uploads/qr-codes');
const productQRDir = path.join(qrDir, 'products');
const farmerQRDir = path.join(qrDir, 'farmers');

if (!process.env.VERCEL) {
    [qrDir, productQRDir, farmerQRDir].forEach(dir => {
        try {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        } catch (err) {
            console.error(`Could not create directory ${dir}:`, err.message);
        }
    });
} else {
    // On Vercel, just try to create them in /tmp
    [qrDir, productQRDir, farmerQRDir].forEach(dir => {
        try {
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        } catch (e) {}
    });
}

// @desc    Generate QR code for a product
// @route   POST /api/qr/product/:id
// @access  Private
const generateProductQR = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if user is the product owner or admin
        if (product.farmer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized to generate QR for this product' });
        }

        // Generate QR code URL - points to public info page
        const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
        const qrUrl = `${baseUrl}/api/qr/product-info/${product._id}`;

        // Generate QR code filename
        const filename = `product-${product._id}.png`;
        const filepath = path.join(productQRDir, filename);
        const qrCodePath = `/uploads/qr-codes/products/${filename}`;

        // Generate QR code image
        await QRCode.toFile(filepath, qrUrl, {
            width: 500,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });

        // Update product with QR code path
        product.qrCodePath = qrCodePath;
        await product.save();

        res.json({
            message: 'QR code generated successfully',
            qrCodePath: qrCodePath,
            qrUrl: qrUrl
        });
    } catch (error) {
        console.error('Error generating product QR:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Generate QR code for a farmer
// @route   POST /api/qr/farmer/:id
// @access  Private
const generateFarmerQR = async (req, res) => {
    try {
        const farmer = await User.findById(req.params.id);

        if (!farmer) {
            return res.status(404).json({ message: 'Farmer not found' });
        }

        // Check if farmer role
        if (farmer.role !== 'farmer') {
            return res.status(400).json({ message: 'User is not a farmer' });
        }

        // Check if user is the farmer or admin
        if (farmer._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized to generate QR for this farmer' });
        }

        // Generate QR code URL - points to public info page
        const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
        const qrUrl = `${baseUrl}/api/qr/farmer-info/${farmer._id}`;

        // Generate QR code filename
        const filename = `farmer-${farmer._id}.png`;
        const filepath = path.join(farmerQRDir, filename);
        const qrCodePath = `/uploads/qr-codes/farmers/${filename}`;

        // Generate QR code image
        await QRCode.toFile(filepath, qrUrl, {
            width: 500,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });

        // Update farmer with QR code path
        farmer.qrCodePath = qrCodePath;
        await farmer.save();

        res.json({
            message: 'QR code generated successfully',
            qrCodePath: qrCodePath,
            qrUrl: qrUrl
        });
    } catch (error) {
        console.error('Error generating farmer QR:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get product info for public display (HTML page)
// @route   GET /api/qr/product-info/:id
// @access  Public
const getProductInfo = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('farmer', 'name email farmLocation isVerified');

        if (!product) {
            return res.status(404).send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Product Not Found - CropLink</title>
                    <style>
                        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                        h1 { color: #e74c3c; }
                    </style>
                </head>
                <body>
                    <h1>Product Not Found</h1>
                    <p>The product you're looking for doesn't exist.</p>
                </body>
                </html>
            `);
        }

        // Generate HTML page
        const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
        const productImage = product.images && product.images.length > 0 
            ? `${baseUrl}/${product.images[0]}` 
            : 'https://via.placeholder.com/400x300?text=No+Image';

        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${product.name} - CropLink</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        .header {
            background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            font-size: 28px;
            margin-bottom: 5px;
        }
        .header p {
            font-size: 14px;
            opacity: 0.9;
        }
        .product-image {
            width: 100%;
            height: 300px;
            object-fit: cover;
        }
        .content {
            padding: 30px;
        }
        .product-title {
            font-size: 32px;
            color: #2c3e50;
            margin-bottom: 10px;
        }
        .badges {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            margin-bottom: 20px;
        }
        .badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }
        .badge-category {
            background: #3498db;
            color: white;
        }
        .badge-type {
            background: #2ecc71;
            color: white;
        }
        .badge-organic {
            background: #27ae60;
            color: white;
        }
        .price {
            font-size: 36px;
            color: #27ae60;
            font-weight: bold;
            margin: 20px 0;
        }
        .price span {
            font-size: 18px;
            color: #7f8c8d;
        }
        .info-section {
            margin: 25px 0;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 10px;
        }
        .info-section h3 {
            color: #2c3e50;
            margin-bottom: 10px;
            font-size: 18px;
        }
        .info-section p {
            color: #555;
            line-height: 1.6;
        }
        .farmer-info {
            background: #e8f5e9;
            border-left: 4px solid #27ae60;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
        }
        .label {
            color: #7f8c8d;
            font-weight: 600;
        }
        .value {
            color: #2c3e50;
            font-weight: 500;
        }
        .verified-badge {
            display: inline-block;
            background: #27ae60;
            color: white;
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 11px;
            margin-left: 8px;
        }
        .footer {
            text-align: center;
            padding: 20px;
            background: #f8f9fa;
            color: #7f8c8d;
            font-size: 14px;
        }
        .footer strong {
            color: #27ae60;
        }
        @media (max-width: 600px) {
            .product-title { font-size: 24px; }
            .price { font-size: 28px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌾 CropLink</h1>
            <p>Farm-to-Consumer Supply Chain</p>
        </div>
        
        <img src="${productImage}" alt="${product.name}" class="product-image" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect fill=%22%23eee%22 width=%22400%22 height=%22300%22/%3E%3Ctext fill=%22%23999%22 font-family=%22sans-serif%22 font-size=%2224%22 dy=%2210.5%22 font-weight=%22bold%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22%3ENo Image%3C/text%3E%3C/svg%3E'">
        
        <div class="content">
            <h2 class="product-title">${product.name}</h2>
            
            <div class="badges">
                <span class="badge badge-category">${product.category}</span>
                <span class="badge badge-type">${product.type}</span>
                ${product.type === 'Organic' ? '<span class="badge badge-organic">✓ Certified</span>' : ''}
            </div>
            
            <div class="price">
                ₹${product.pricePerKg}
                <span>/ kg</span>
            </div>
            
            <div class="info-row">
                <span class="label">Available Quantity:</span>
                <span class="value">${product.quantity} kg</span>
            </div>
            
            ${product.description ? `
            <div class="info-section">
                <h3>📝 Description</h3>
                <p>${product.description}</p>
            </div>
            ` : ''}
            
            <div class="info-section farmer-info">
                <h3>👨‍🌾 Farmer Information</h3>
                <div class="info-row">
                    <span class="label">Name:</span>
                    <span class="value">
                        ${product.farmer.name}
                        ${product.farmer.isVerified ? '<span class="verified-badge">✓ Verified</span>' : ''}
                    </span>
                </div>
                ${product.farmer.farmLocation ? `
                <div class="info-row">
                    <span class="label">Location:</span>
                    <span class="value">${product.farmer.farmLocation}</span>
                </div>
                ` : ''}
                ${product.farmer.email ? `
                <div class="info-row">
                    <span class="label">Contact:</span>
                    <span class="value">${product.farmer.email}</span>
                </div>
                ` : ''}
            </div>
            
            ${product.isApproved ? `
            <div class="info-section" style="background: #e3f2fd; border-left: 4px solid #2196f3;">
                <h3>✅ Quality Verified</h3>
                <p>This product has been approved by CropLink administrators.</p>
            </div>
            ` : ''}
        </div>
        
        <div class="footer">
            <p>Powered by <strong>CropLink</strong></p>
            <p style="margin-top: 5px; font-size: 12px;">Connecting Farmers Directly with Consumers</p>
        </div>
    </div>
</body>
</html>
        `;

        res.send(html);
    } catch (error) {
        console.error('Error fetching product info:', error);
        res.status(500).send('Error loading product information');
    }
};

// @desc    Get farmer info for public display (HTML page)
// @route   GET /api/qr/farmer-info/:id
// @access  Public
const getFarmerInfo = async (req, res) => {
    try {
        const farmer = await User.findById(req.params.id);

        if (!farmer || farmer.role !== 'farmer') {
            return res.status(404).send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Farmer Not Found - CropLink</title>
                    <style>
                        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                        h1 { color: #e74c3c; }
                    </style>
                </head>
                <body>
                    <h1>Farmer Not Found</h1>
                    <p>The farmer profile you're looking for doesn't exist.</p>
                </body>
                </html>
            `);
        }

        // Get farmer's products
        const products = await Product.find({ farmer: farmer._id, isApproved: true });

        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${farmer.name} - CropLink Farmer</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        .header {
            background: linear-gradient(135deg, #27ae60 0%, #229954 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .header h1 {
            font-size: 28px;
            margin-bottom: 5px;
        }
        .header p {
            font-size: 14px;
            opacity: 0.9;
        }
        .content {
            padding: 30px;
        }
        .farmer-name {
            font-size: 32px;
            color: #2c3e50;
            margin-bottom: 10px;
        }
        .verified-badge {
            display: inline-block;
            background: #27ae60;
            color: white;
            padding: 6px 15px;
            border-radius: 20px;
            font-size: 14px;
            margin: 10px 0;
        }
        .info-section {
            margin: 25px 0;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 10px;
        }
        .info-section h3 {
            color: #2c3e50;
            margin-bottom: 15px;
            font-size: 18px;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin: 12px 0;
            padding: 10px 0;
            border-bottom: 1px solid #ecf0f1;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .label {
            color: #7f8c8d;
            font-weight: 600;
        }
        .value {
            color: #2c3e50;
            font-weight: 500;
        }
        .products-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        .product-card {
            background: white;
            border: 2px solid #ecf0f1;
            border-radius: 12px;
            padding: 15px;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .product-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        .product-name {
            font-size: 18px;
            color: #2c3e50;
            font-weight: 600;
            margin-bottom: 8px;
        }
        .product-type {
            display: inline-block;
            background: #2ecc71;
            color: white;
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 11px;
            margin-bottom: 10px;
        }
        .product-price {
            font-size: 24px;
            color: #27ae60;
            font-weight: bold;
        }
        .product-price span {
            font-size: 14px;
            color: #7f8c8d;
        }
        .no-products {
            text-align: center;
            color: #7f8c8d;
            padding: 40px;
            font-style: italic;
        }
        .footer {
            text-align: center;
            padding: 20px;
            background: #f8f9fa;
            color: #7f8c8d;
            font-size: 14px;
        }
        .footer strong {
            color: #27ae60;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>👨‍🌾 Farmer Profile</h1>
            <p>CropLink Verified Farmer</p>
        </div>
        
        <div class="content">
            <h2 class="farmer-name">${farmer.name}</h2>
            
            ${farmer.isVerified ? '<span class="verified-badge">✓ Verified Farmer</span>' : '<span class="verified-badge" style="background: #95a5a6;">⏳ Pending Verification</span>'}
            
            <div class="info-section">
                <h3>📋 Farmer Details</h3>
                ${farmer.farmLocation ? `
                <div class="info-row">
                    <span class="label">📍 Location:</span>
                    <span class="value">${farmer.farmLocation}</span>
                </div>
                ` : ''}
                ${farmer.email ? `
                <div class="info-row">
                    <span class="label">✉️ Contact:</span>
                    <span class="value">${farmer.email}</span>
                </div>
                ` : ''}
                <div class="info-row">
                    <span class="label">📦 Total Products:</span>
                    <span class="value">${products.length} products</span>
                </div>
            </div>
            
            <div class="info-section" style="background: #e8f5e9; border-left: 4px solid #27ae60;">
                <h3>🌱 Available Products</h3>
                
                ${products.length > 0 ? `
                <div class="products-grid">
                    ${products.map(product => `
                    <div class="product-card">
                        <div class="product-name">${product.name}</div>
                        <span class="product-type">${product.type}</span>
                        <div class="product-price">
                            ₹${product.pricePerKg}
                            <span>/ kg</span>
                        </div>
                        <div style="margin-top: 10px; color: #7f8c8d; font-size: 14px;">
                            ${product.quantity} kg available
                        </div>
                    </div>
                    `).join('')}
                </div>
                ` : '<div class="no-products">No products available at the moment</div>'}
            </div>
        </div>
        
        <div class="footer">
            <p>Powered by <strong>CropLink</strong></p>
            <p style="margin-top: 5px; font-size: 12px;">Connecting Farmers Directly with Consumers</p>
        </div>
    </div>
</body>
</html>
        `;

        res.send(html);
    } catch (error) {
        console.error('Error fetching farmer info:', error);
        res.status(500).send('Error loading farmer information');
    }
};

// @desc    Get wallet info for public display (HTML page)
// @route   GET /api/qr/wallet-info/:id
// @access  Public
const getWalletInfo = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user || !user.walletAddress) {
            return res.status(404).send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Wallet Not Found - CropLink</title>
                    <style>
                        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                        h1 { color: #e74c3c; }
                    </style>
                </head>
                <body>
                    <h1>Wallet Not Found</h1>
                    <p>The wallet you're looking for doesn't exist.</p>
                </body>
                </html>
            `);
        }

        // Get user's products if they are a farmer
        let products = [];
        if (user.role === 'farmer') {
            products = await Product.find({ farmer: user._id, isApproved: true });
        }

        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blockchain Identity - ${user.name}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .header h1 {
            font-size: 28px;
            margin-bottom: 5px;
        }
        .header p {
            font-size: 14px;
            opacity: 0.9;
        }
        .content {
            padding: 30px;
        }
        .user-name {
            font-size: 32px;
            color: #2c3e50;
            margin-bottom: 10px;
        }
        .role-badge {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 8px 20px;
            border-radius: 20px;
            font-size: 14px;
            text-transform: uppercase;
            font-weight: 600;
            margin: 10px 0;
        }
        .verified-badge {
            display: inline-block;
            background: #27ae60;
            color: white;
            padding: 6px 15px;
            border-radius: 20px;
            font-size: 14px;
            margin: 10px 0 10px 10px;
        }
        .info-section {
            margin: 25px 0;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 10px;
        }
        .info-section.highlight {
            background: linear-gradient(135deg, #e8e8ff 0%, #f3e7ff 100%);
            border-left: 4px solid #667eea;
        }
        .info-section h3 {
            color: #2c3e50;
            margin-bottom: 15px;
            font-size: 18px;
        }
        .wallet-address {
            background: white;
            padding: 15px;
            border-radius: 8px;
            word-break: break-all;
            font-family: 'Courier New', monospace;
            font-size: 13px;
            color: #667eea;
            border: 2px solid #667eea;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin: 12px 0;
            padding: 10px 0;
            border-bottom: 1px solid #ecf0f1;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .label {
            color: #7f8c8d;
            font-weight: 600;
        }
        .value {
            color: #2c3e50;
            font-weight: 500;
        }
        .authenticity-badge {
            display: flex;
            align-items: center;
            gap: 10px;
            background: #d4edda;
            border: 2px solid #28a745;
            padding: 15px;
            border-radius: 10px;
            margin: 15px 0;
        }
        .authenticity-icon {
            width: 40px;
            height: 40px;
            background: #28a745;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 24px;
            font-weight: bold;
        }
        .authenticity-text {
            flex: 1;
        }
        .authenticity-text h4 {
            color: #155724;
            margin-bottom: 4px;
        }
        .authenticity-text p {
            color: #155724;
            font-size: 13px;
        }
        .products-grid {
            display: grid;
            gap: 15px;
            margin-top: 15px;
        }
        .product-card {
            background: white;
            border: 2px solid #ecf0f1;
            border-radius: 10px;
            padding: 15px;
        }
        .product-name {
            font-size: 16px;
            color: #2c3e50;
            font-weight: 600;
            margin-bottom: 8px;
        }
        .product-type {
            display: inline-block;
            background: #2ecc71;
            color: white;
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 11px;
            margin-bottom: 8px;
        }
        .footer {
            text-align: center;
            padding: 20px;
            background: #f8f9fa;
            color: #7f8c8d;
            font-size: 14px;
        }
        .footer strong {
            color: #667eea;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Blockchain Identity</h1>
            <p>CropLink Supply Chain Verification</p>
        </div>
        
        <div class="content">
            <h2 class="user-name">${user.name}</h2>
            <span class="role-badge">${user.role}</span>
            ${user.isVerified ? '<span class="verified-badge">✓ Verified</span>' : ''}
            
            <div class="authenticity-badge">
                <div class="authenticity-icon">✓</div>
                <div class="authenticity-text">
                    <h4>Blockchain Verified Identity</h4>
                    <p>This identity is verified on the blockchain and can be used to authenticate products</p>
                </div>
            </div>
            
            <div class="info-section highlight">
                <h3>🔑 Wallet Address</h3>
                <div class="wallet-address">
                    ${user.walletAddress}
                </div>
                <p style="margin-top: 10px; font-size: 13px; color: #7f8c8d;">
                    This address is used to cryptographically sign and verify all product updates
                </p>
            </div>
            
            <div class="info-section">
                <h3>👤 Identity Details</h3>
                ${user.email ? `
                <div class="info-row">
                    <span class="label">Email:</span>
                    <span class="value">${user.email}</span>
                </div>
                ` : ''}
                ${user.farmLocation ? `
                <div class="info-row">
                    <span class="label">Location:</span>
                    <span class="value">${user.farmLocation}</span>
                </div>
                ` : ''}
                <div class="info-row">
                    <span class="label">Role:</span>
                    <span class="value">${user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span>
                </div>
                <div class="info-row">
                    <span class="label">Verification:</span>
                    <span class="value">${user.isVerified ? '✓ Verified Identity' : 'Pending Verification'}</span>
                </div>
            </div>
            
            ${user.role === 'farmer' && products.length > 0 ? `
            <div class="info-section" style="background: #e8f5e9; border-left: 4px solid #27ae60;">
                <h3>🌱 Verified Products (${products.length})</h3>
                <div class="products-grid">
                    ${products.map(product => `
                    <div class="product-card">
                        <div class="product-name">${product.name}</div>
                        <span class="product-type">${product.type}</span>
                        <div style="color: #27ae60; font-weight: 600; margin-top: 8px;">
                            ₹${product.pricePerKg}/kg
                        </div>
                    </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
            
            <div class="info-section" style="background: #fff3cd; border-left: 4px solid #ffc107;">
                <h3>🔒 Product Authenticity</h3>
                <p style="color: #856404; line-height: 1.6;">
                    All products associated with this identity are cryptographically signed on the blockchain. 
                    This ensures that only the legitimate owner can update product information, preventing 
                    counterfeiting and ensuring supply chain transparency.
                </p>
            </div>
        </div>
        
        <div class="footer">
            <p>Powered by <strong>CropLink</strong></p>
            <p style="margin-top: 5px; font-size: 12px;">Blockchain-Verified Supply Chain Authenticity</p>
        </div>
    </div>
</body>
</html>
        `;

        res.send(html);
    } catch (error) {
        console.error('Error fetching wallet info:', error);
        res.status(500).send('Error loading wallet information');
    }
};

module.exports = {
    generateProductQR,
    generateFarmerQR,
    getProductInfo,
    getFarmerInfo,
    getWalletInfo
};
