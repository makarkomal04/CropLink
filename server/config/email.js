const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
    // For development, use ethereal email (fake SMTP)
    // For production, replace with real SMTP credentials
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
};

// Send email helper
const sendEmail = async ({ to, subject, html }) => {
    try {
        const transporter = createTransporter();
        
        const mailOptions = {
            from: `"CropLink" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

// Email templates
const emailTemplates = {
    orderConfirmation: (order, userName) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2E8B57;">Order Confirmation</h2>
            <p>Dear ${userName},</p>
            <p>Thank you for your order! Your order has been placed successfully.</p>
            
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3>Order Details:</h3>
                <p><strong>Order ID:</strong> ${order._id}</p>
                <p><strong>Total Amount:</strong> ₹${order.totalPrice}</p>
                <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
            </div>

            <h4>Items Ordered:</h4>
            <ul>
                ${order.orderItems.map(item => `
                    <li>${item.name} - ${item.qty} kg @ ₹${item.price}/kg = ₹${item.qty * item.price}</li>
                `).join('')}
            </ul>

            <p>We'll notify you once your order is ready for delivery.</p>
            <p>Thank you for supporting local farmers!</p>
            
            <hr style="margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">
                This is an automated email from CropLink. Please do not reply.
            </p>
        </div>
    `,

    newOrderToFarmer: (order, farmerName, farmerProducts) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2E8B57;">New Order Received!</h2>
            <p>Dear ${farmerName},</p>
            <p>Great news! You have a new order for your products.</p>
            
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3>Order Details:</h3>
                <p><strong>Order ID:</strong> ${order._id}</p>
                <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
            </div>

            <h4>Your Products in this Order:</h4>
            <ul>
                ${farmerProducts.map(item => `
                    <li>${item.name} - ${item.qty} kg @ ₹${item.price}/kg</li>
                `).join('')}
            </ul>

            <p>Please ensure these products are ready for quality inspection.</p>
            
            <hr style="margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">
                This is an automated email from CropLink. Please do not reply.
            </p>
        </div>
    `,

    productApproved: (product, farmerName) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2E8B57;">Product Approved! 🎉</h2>
            <p>Dear ${farmerName},</p>
            <p>Good news! Your product has been approved and is now live on the marketplace.</p>
            
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3>Product Details:</h3>
                <p><strong>Product:</strong> ${product.name}</p>
                <p><strong>Category:</strong> ${product.category}</p>
                <p><strong>Type:</strong> ${product.type}</p>
                <p><strong>Price:</strong> ₹${product.pricePerKg}/kg</p>
            </div>

            <p>Customers can now see and purchase your product. Good luck with your sales!</p>
            
            <hr style="margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">
                This is an automated email from CropLink. Please do not reply.
            </p>
        </div>
    `,

    farmerVerified: (farmerName) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2E8B57;">Account Verified! 🎊</h2>
            <p>Dear ${farmerName},</p>
            <p>Congratulations! Your farmer account has been verified by our admin team.</p>
            
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p>You can now:</p>
                <ul>
                    <li>Add your products to the marketplace</li>
                    <li>Manage your inventory</li>
                    <li>Receive orders from customers</li>
                    <li>Track your sales and revenue</li>
                </ul>
            </div>

            <p>Start listing your fresh produce today and connect directly with customers!</p>
            <p><a href="http://localhost:5173/farmer" style="background: #2E8B57; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Go to Dashboard</a></p>
            
            <hr style="margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">
                This is an automated email from CropLink. Please do not reply.
            </p>
        </div>
    `,
};

module.exports = {
    sendEmail,
    emailTemplates,
};
