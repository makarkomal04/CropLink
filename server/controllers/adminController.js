const User = require('../models/User');
const Product = require('../models/Product');
const { sendEmail, emailTemplates } = require('../config/email');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify/Approve farmer
// @route   PUT /api/admin/users/:id/verify
// @access  Private/Admin
const verifyUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role !== 'farmer') {
            return res.status(400).json({ message: 'Only farmers need verification' });
        }

        user.isVerified = true;
        await user.save();

        // Send verification email to farmer
        try {
            if (user.email) {
                await sendEmail({
                    to: user.email,
                    subject: 'Account Verified - CropLink',
                    html: emailTemplates.farmerVerified(user.name)
                });
            }
        } catch (emailError) {
            console.error('Error sending verification email:', emailError);
        }

        res.json({ message: 'Farmer verified successfully', user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Deactivate user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deactivateUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User deactivated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get pending products
// @route   GET /api/admin/products/pending
// @access  Private/Admin
const getPendingProducts = async (req, res) => {
    try {
        const products = await Product.find({ isApproved: false })
            .populate('farmer', 'name email farmLocation')
            .sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Approve product
// @route   PUT /api/admin/products/:id/approve
// @access  Private/Admin
const approveProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        product.isApproved = true;
        await product.save();

        // Populate farmer details for email
        await product.populate('farmer', 'name email');

        // Send approval email to farmer
        try {
            if (product.farmer && product.farmer.email) {
                await sendEmail({
                    to: product.farmer.email,
                    subject: 'Product Approved - CropLink',
                    html: emailTemplates.productApproved(product, product.farmer.name)
                });
            }
        } catch (emailError) {
            console.error('Error sending product approval email:', emailError);
        }

        res.json({ message: 'Product approved successfully', product });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reject product
// @route   PUT /api/admin/products/:id/reject
// @access  Private/Admin
const rejectProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({ message: 'Product rejected and removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllUsers,
    verifyUser,
    deactivateUser,
    getPendingProducts,
    approveProduct,
    rejectProduct,
};
