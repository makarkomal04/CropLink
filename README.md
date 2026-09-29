# CropLink - Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Node.js v16 or higher
- MongoDB (local or Atlas)
- Git

### Installation

1. **Clone/Navigate to Project**
```bash
cd "d:/Projects 2025/Final Year projects/CropLink"
```

2. **Backend Setup**
```bash
cd server
npm install

# Create .env file with:
MONGO_URI=mongodb://localhost:27017/croplink
JWT_SECRET=your_secret_key_here
PORT=5000

# Optional for email (can skip for testing):
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Seed database with test accounts
node seed.js

# Start backend
npm run dev
```

3. **Frontend Setup**
```bash
cd ../frontend
npm install
npm run dev
```

## 📱 Test Accounts

After running `node seed.js`, use these accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@croplink.com | admin123 |
| Farmer | farmer@test.com | farmer123 |
| Customer | customer@test.com | customer123 |

## 🎯 Quick Feature Tour

### As a Customer:
1. Go to `http://localhost:5173/shop`
2. Browse products with filters
3. Add to cart
4. Checkout and place order
5. View order history at `/orders`

### As a Farmer:
1. Login with farmer account
2. Go to `/farmer` - Add products
3. View orders at `/farmer/orders`
4. Check revenue at `/farmer/revenue`

### As an Admin:
1. Login with admin account
2. Go to `/admin/users` - Manage users
3. Go to `/admin/products` - Approve products

## 🔧 Common Issues

### Backend won't start:
- Check MongoDB is running
- Verify `.env` file exists
- Run `npm install` again

### Frontend shows 404:
- Check backend is running on port 5000
- Clear browser cache
- Check console for errors

### Email not sending:
- This is normal if EMAIL credentials not configured
- Emails fail gracefully without breaking app
- See `EMAIL_SETUP.md` for configuration

## 📊 Project Structure

```
CropLink/
├── frontend/          # React frontend
│   ├── src/
│   │   ├── pages/     # All pages
│   │   ├── components/
│   │   ├── context/
│   │   └── services/
│   └── package.json
│
└── server/            # Express backend
    ├── controllers/
    ├── models/
    ├── routes/
    ├── middleware/
    ├── config/
    ├── seed.js        # Database seeder
    └── package.json
```

## ✨ Features Implemented

✅ User Authentication (Admin/Farmer/Customer)
✅ Product Management with Admin Approval
✅ Shopping Cart & Checkout
✅ Order System with Email Notifications
✅ Farmer Revenue Analytics
✅ Admin User & Product Management
✅ Advanced Product Filtering
✅ Toast Notifications
✅ Security Hardening

## 🎓 Next Steps

1. Configure email (optional)
2. Add more sample products
3. Test all user flows
4. Deploy to production
5. Gather user feedback

## 📞 Support

For issues or questions:
- Check console errors
- Review `walkthrough.md` for detailed docs
- Check `task.md` for feature list

**Happy Farming! 🌾**
