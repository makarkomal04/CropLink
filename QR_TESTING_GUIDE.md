# Quick QR Code Testing Guide

## Prerequisites
✅ Server is running on port 5000
✅ MongoDB is connected

## Step-by-Step Testing

### 1. Create a Product (Frontend or Postman)

**Using Frontend:**
- Log in as a farmer
- Go to "Add Product"
- Fill in product details
- Submit

**Using Postman:**
```
POST http://localhost:5000/api/products
Headers:
  Authorization: Bearer {your-auth-token}
  Content-Type: application/json

Body:
{
  "name": "Fresh Organic Apples",
  "category": "Fruits",
  "type": "Organic",
  "quantity": 50,
  "pricePerKg": 120,
  "description": "Handpicked organic apples from my farm"
}
```

**Response will include:**
```json
{
  "_id": "67abc123...",
  ...
  "qrCodePath": "/uploads/qr-codes/products/product-67abc123....png"
}
```

### 2. View the QR Code

**Copy the product ID from the response, then open in browser:**
```
http://localhost:5000/uploads/qr-codes/products/product-{PASTE_ID_HERE}.png
```

Example:
```
http://localhost:5000/uploads/qr-codes/products/product-67abc123456789.png
```

### 3. Test the Public Info Page

**Open in browser:**
```
http://localhost:5000/api/qr/product-info/{PRODUCT_ID}
```

You should see a beautiful page with:
- Product image
- Name and badges
- Price
- Farmer info
- Description

### 4. Scan with Google Lens

**On Desktop:**
1. Keep the QR code displayed on your screen
2. Open Google Lens on your smartphone
3. Point camera at the QR code
4. Tap the link when it appears
5. See the product info page on your phone

**Mobile to Mobile:**
1. Share the QR code image
2. Open Google Lens
3. Scan the QR
4. Verify info page loads

### 5. Test Farmer QR Code

**Generate farmer QR:**
```
POST http://localhost:5000/api/qr/farmer/{FARMER_USER_ID}
Headers:
  Authorization: Bearer {farmer-or-admin-token}
```

**View farmer page:**
```
http://localhost:5000/api/qr/farmer-info/{FARMER_USER_ID}
```

### 6. Get Product/Farmer IDs

**List all products:**
```
GET http://localhost:5000/api/products
```

**Find farmer ID from product:**
```json
{
  "farmer": {
    "_id": "67abc...",  // <-- This is the farmer ID
    "name": "John Doe"
  }
}
```

## Quick Test URLs

Replace `{id}` with actual IDs:

| Type | URL |
|------|-----|
| Product Info Page | `http://localhost:5000/api/qr/product-info/{id}` |
| Farmer Info Page | `http://localhost:5000/api/qr/farmer-info/{id}` |
| Product QR Image | `http://localhost:5000/uploads/qr-codes/products/product-{id}.png` |
| Farmer QR Image | `http://localhost:5000/uploads/qr-codes/farmers/farmer-{id}.png` |

## Troubleshooting

**QR code not generated?**
- Check server logs for errors
- Verify `uploads/qr-codes/products` directory exists
- Try manually generating: `POST /api/qr/product/{id}`

**Info page shows "Not Found"?**
- Verify product/farmer ID is correct
- Check database to ensure document exists
- Product must be populated with farmer info

**QR scan doesn't work?**
- Ensure QR image is clear and well-lit
- Try zooming in/out on the QR code
- Test with a different QR scanner app

## Expected Results

✅ New products automatically get QR codes
✅ QR code PNG files are created in `uploads/qr-codes/products/`
✅ Scanning QR with Google Lens opens the info page
✅ Info page is mobile-responsive and looks good on all devices
✅ Farmer pages show all their products
✅ Verified badges display for verified farmers
✅ Product images load correctly (or show placeholder)

## Next Steps

Once testing is successful:
- Add QR download buttons in the farmer dashboard
- Print test QR codes on paper stickers
- Test in a physical store/farm scenario
- Deploy to production and update `BASE_URL` in `.env`
