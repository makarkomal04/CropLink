const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');
const Product = require('../models/Product');
const User = require('../models/User');
const blockchainService = require('../services/BlockchainService');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    try {
        const keyword = req.query.keyword
            ? {
                  name: {
                      $regex: req.query.keyword,
                      $options: 'i',
                  },
              }
            : {};

        const products = await Product.find({ ...keyword }).populate('farmer', 'name farmLocation');
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('farmer', 'name email farmLocation');

        if (product) {
            // Auto-generate QR code if missing (for older products)
            if (!product.qrCodePath) {
                try {
                    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
                    const qrUrl = `${frontendUrl}/verify/${product._id}`;
                    
                    const qrDir = path.join(__dirname, '../uploads/qr-codes/products');
                    if (!fs.existsSync(qrDir)) {
                        fs.mkdirSync(qrDir, { recursive: true });
                    }

                    const filename = `product-${product._id}.png`;
                    const filepath = path.join(qrDir, filename);
                    const qrCodePathStatic = `/uploads/qr-codes/products/${filename}`;

                    // Generate QR code
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
                    console.log(`Generated missing QR code for product: ${product._id}`);
                } catch (qrErr) {
                    console.error('Lazy QR generation failed:', qrErr);
                }
            }
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Farmer
// @desc    Create a product
// @route   POST /api/products
// @access  Private/Farmer
const createProduct = async (req, res) => {
    try {
        const { name, category, type, quantity, pricePerKg, description, harvestDate, expiryDate, batchNumber, farmerLocation } = req.body;
        
        // Handle image upload if present
        let imagePath = '';
        if (req.file) {
            imagePath = req.file.path.replace(/\\/g, "/"); // Normalize path
        }

        console.log('Creating product with data:', {
            name, category, type, quantity, pricePerKg,
            farmerId: req.user._id,
            imagePath: imagePath
        });

        const product = new Product({
            farmer: req.user._id,
            name,
            category,
            type,
            quantity: Number(quantity) || 0,
            pricePerKg: Number(pricePerKg) || 0,
            description,
            harvestDate, 
            expiryDate, 
            batchNumber,
            farmerLocation: farmerLocation || req.user.farmLocation || 'Unknown',
            images: imagePath ? [imagePath] : [],
        });

        const createdProduct = await product.save();

        // -----------------------------------------------------
        // BLOCKCHAIN REGISTRATION
        // -----------------------------------------------------
        try {
            // 1. Fetch user with encrypted private key
            const userWithKey = await User.findById(req.user._id).select('+privateKeyEncrypted');
            
            if (userWithKey && userWithKey.walletCreated && userWithKey.privateKeyEncrypted) {
                // 2. Decrypt private key
                const privateKey = blockchainService.decryptPrivateKey(userWithKey.privateKeyEncrypted);
                
                // 3. Prepare data for hashing
                // We use immutable fields verifying the product's origin and core attributes
                const productDetails = {
                    productId: createdProduct._id.toString(),
                    name: createdProduct.name,
                    category: createdProduct.category,
                    quantity: createdProduct.quantity,
                    farmerId: createdProduct.farmer.toString(),
                    harvestDate: createdProduct.harvestDate ? new Date(createdProduct.harvestDate).toISOString() : '',
                    batchNumber: createdProduct.batchNumber || ''
                };

                console.log(`Registering product ${createdProduct._id} on blockchain...`);

                // 4. Register on Chain
                const receipt = await blockchainService.registerProductOnBlockchain(
                    createdProduct._id.toString(), // Use MongoID as BatchID
                    productDetails,
                    privateKey
                );

                // 5. Update Product with Blockchain Info
                createdProduct.blockchainId = receipt.txHash;
                await createdProduct.save();
                
                console.log(`Product registered! Tx: ${receipt.txHash}`);
            } else {
                console.log('Skipping blockchain registration: User has no wallet.');
            }
        } catch (bcError) {
            console.error('Blockchain registration failed:', bcError.message);
            // We do NOT fail the request, just log it. Product is created in DB.
        }

        // Auto-generate QR code for the product
        try {
            // Point to FRONTEND verification page
            // Priority: FRONTEND_URL > Derived from BASE_URL > localhost
            let frontendUrl = process.env.FRONTEND_URL;
            if (!frontendUrl && process.env.BASE_URL) {
                // If we have BASE_URL like http://192.168.31.141:5000, 
                // we assume frontend is on same IP but port 5173
                frontendUrl = process.env.BASE_URL.replace(':5000', ':5173');
            }
            if (!frontendUrl) frontendUrl = 'http://localhost:5173';
            
            const qrUrl = `${frontendUrl}/verify/${createdProduct._id}`;
            
            // Ensure QR directory exists
            // Use /tmp on Vercel as it's the only writable directory
            const qrDir = process.env.VERCEL ? '/tmp/qr-codes/' : path.join(__dirname, '../uploads/qr-codes/products');
            if (!fs.existsSync(qrDir)) {
                try {
                    fs.mkdirSync(qrDir, { recursive: true });
                } catch (mkdirErr) {
                    console.error('Could not create QR directory, skipping local save:', mkdirErr.message);
                }
            }

            const filename = `product-${createdProduct._id}.png`;
            const filepath = path.join(qrDir, filename);
            const qrCodePath = `/uploads/qr-codes/products/${filename}`;

            // Generate QR code
            await QRCode.toFile(filepath, qrUrl, {
                width: 500,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            });

            // Update product with QR code path
            createdProduct.qrCodePath = qrCodePath;
            await createdProduct.save();

            console.log(`QR code generated for product ${createdProduct._id}`);
        } catch (qrError) {
            console.error('Error generating QR code:', qrError);
        }

        // Populate farmer for Android app compatibility (GSON expects an object)
        await createdProduct.populate('farmer', 'name email farmLocation isVerified role');

        res.status(201).json(createdProduct);
    } catch (error) {
        console.error('Product creation error:', error);
        res.status(400).json({ 
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
        });
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Farmer
const updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            // Check if user is the product owner
            if (product.farmer.toString() !== req.user.id) {
                return res.status(401).json({ message: 'Not authorized to update this product' });
            }

            product.name = req.body.name || product.name;
            product.category = req.body.category || product.category;
            product.type = req.body.type || product.type;
            product.quantity = req.body.quantity || product.quantity;
            product.pricePerKg = req.body.pricePerKg || product.pricePerKg;
            product.description = req.body.description || product.description;

             if (req.file) {
                product.images = [req.file.path.replace(/\\/g, "/")];
            }

            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Farmer
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            if (product.farmer.toString() !== req.user.id) {
                return res.status(401).json({ message: 'Not authorized to delete this product' });
            }

            await product.deleteOne(); // or product.remove() depending on Mongoose version
            res.json({ message: 'Product removed' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
};
