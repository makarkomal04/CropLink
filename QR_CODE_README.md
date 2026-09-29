# QR Code Feature - Quick Reference

## 🎯 What's New

CropLink now supports QR codes for products and farmers! When scanned with Google Lens, these QR codes display beautiful web pages with product or farmer information.

## 🚀 Quick Start

### Automatic QR Generation
Every new product automatically gets a QR code when created!

### Manual Generation
```bash
# Generate QR for a product
POST /api/qr/product/{productId}

# Generate QR for a farmer
POST /api/qr/farmer/{farmerId}
```

### Access Public Pages
```
Product Info: /api/qr/product-info/{productId}
Farmer Info: /api/qr/farmer-info/{farmerId}
```

### Download QR Images
```
/uploads/qr-codes/products/product-{id}.png
/uploads/qr-codes/farmers/farmer-{id}.png
```

## 📱 How to Test

1. Create a product (automatically generates QR)
2. Find QR at: `server/uploads/qr-codes/products/`
3. Scan with Google Lens
4. View the product info page!

See [QR_TESTING_GUIDE.md](./QR_TESTING_GUIDE.md) for detailed testing instructions.

## 📚 Documentation

- **Testing Guide**: [QR_TESTING_GUIDE.md](./QR_TESTING_GUIDE.md)
- **Implementation Details**: See brain artifacts for complete walkthrough

## ✨ Features

- ✅ Auto-generate QR codes on product creation
- ✅ Beautiful, mobile-responsive info pages
- ✅ Farmer verification badges
- ✅ Product images and details
- ✅ Works with Google Lens and all QR scanners
- ✅ Public pages (no login required for viewing)

## 🔧 Technical Stack

- **QR Generation**: `qrcode` npm package
- **Storage**: `/uploads/qr-codes/` directory
- **Database**: MongoDB (qrCodePath fields added)
- **Format**: 500x500px PNG images

---

**Server Status**: ✅ Running on port 5000
