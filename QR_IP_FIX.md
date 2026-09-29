# QR Code IP Address Configuration Fix

## Issue
QR codes were using `localhost` which doesn't work when scanned from a mobile device. Mobile devices interpret `localhost` as their own address, not the development server.

## Solution
Updated all QR code URLs to use the local network IP address: **192.168.31.141**

## Changes Made

### 1. Backend - `.env`
Added `BASE_URL` configuration:
```env
BASE_URL=http://192.168.31.141:5000
```

This is used by the QR controller to generate correct URLs.

### 2. Frontend - `WalletPage.jsx`
Updated wallet info URL:
```javascript
// Old
const walletInfoUrl = user?._id ? `${window.location.origin}/api/qr/wallet-info/${user._id}` : '';

// New
const walletInfoUrl = user?._id ? `http://192.168.31.141:5000/api/qr/wallet-info/${user._id}` : '';
```

## How QR Codes Now Work

**Product QR**: `http://192.168.31.141:5000/api/qr/product-info/{productId}`
**Farmer QR**: `http://192.168.31.141:5000/api/qr/farmer-info/{farmerId}`
**Wallet QR**: `http://192.168.31.141:5000/api/qr/wallet-info/{userId}`

## Testing on Mobile

1. **Ensure both devices are on the same WiFi network**
2. **Restart the server** to pick up the new `BASE_URL`:
   ```bash
   cd server
   npm start
   ```
3. **Create a new product** or **refresh wallet page** to generate new QR codes
4. **Scan with Google Lens** on your phone
5. The page should now load successfully!

## Important Notes

- ✅ Your phone and computer must be on the **same WiFi network**
- ✅ The IP address `192.168.31.141` is your current local network IP
- ⚠️ If you change networks or restart your router, the IP might change
- ⚠️ Windows Firewall must allow port 5000 connections

## Troubleshooting

**QR still doesn't work?**
1. Check if both devices are on the same WiFi
2. Verify IP hasn't changed: `ipconfig | findstr IPv4`
3. Test in browser on phone: `http://192.168.31.141:5000`
4. Check Windows Firewall settings

**IP Address Changed?**
1. Run `ipconfig | findstr IPv4` to get new IP
2. Update `BASE_URL` in `.env`
3. Update IP in `WalletPage.jsx`
4. Restart the server
