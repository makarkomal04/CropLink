const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
// const xss = require('xss-clean'); // Removed due to compatibility issues with newer Express
// const mongoSanitize = require('express-mongo-sanitize'); // Removed due to compatibility issues
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Trust proxy for rate limiting on Vercel/proxies
app.set('trust proxy', 1);

// CORS Middleware - MUST come first
const allowedOrigins = [
    'http://localhost:5173', 
    'http://localhost:5174', 
    'http://localhost:3000',
    'http://192.168.31.141:5173', // Add specific IP
    process.env.FRONTEND_URL // Add from env
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            // Allow any IP on the same network in dev mode
            if (process.env.NODE_ENV === 'development' && origin.match(/^http:\/\/192\.168\./)) {
                return callback(null, true);
            }
            return callback(null, true); // For now, allow all in dev to avoid blockers
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security Middleware - AFTER CORS
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 500, // increased limit for dev/testing
    validate: { trustProxy: false } // Disable trust proxy warning for Vercel
});
app.use('/api/', limiter);

// Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const farmerRoutes = require('./routes/farmerRoutes');
const warehouseRoutes = require('./routes/warehouseRoutes');
const blockchainRoutes = require('./routes/blockchainRoutes');
const qrRoutes = require('./routes/qrRoutes');
const shipmentRoutes = require('./routes/shipmentRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');

// Initialize blockchain service
const blockchainService = require('./services/BlockchainService');
console.log('Blockchain enabled:', blockchainService.isEnabled);

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/farmers', farmerRoutes);
app.use('/api/warehouse', warehouseRoutes);
app.use('/api/blockchain', blockchainRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/shipment', shipmentRoutes);
app.use('/api/delivery', deliveryRoutes);

// Error handling middleware
// Make uploads folder static
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

app.get('/', (req, res) => {
    res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
