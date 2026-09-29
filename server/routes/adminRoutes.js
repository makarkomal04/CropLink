const express = require('express');
const router = express.Router();
const {
    getAllUsers,
    verifyUser,
    deactivateUser,
    getPendingProducts,
    approveProduct,
    rejectProduct,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes are admin-only
router.use(protect);
router.use(authorize('admin'));

// User management routes
router.get('/users', getAllUsers);
router.put('/users/:id/verify', verifyUser);
router.delete('/users/:id', deactivateUser);

// Product management routes
router.get('/products/pending', getPendingProducts);
router.put('/products/:id/approve', approveProduct);
router.put('/products/:id/reject', rejectProduct);

module.exports = router;
