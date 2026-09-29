const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
    .get(getProducts)
    .post(protect, authorize('farmer', 'admin'), upload.single('image'), createProduct);

router.route('/:id')
    .get(getProductById)
    .put(protect, authorize('farmer', 'admin'), upload.single('image'), updateProduct)
    .delete(protect, authorize('farmer', 'admin'), deleteProduct);

module.exports = router;
