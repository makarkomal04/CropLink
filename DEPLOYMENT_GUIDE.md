# CropLink Blockchain - Deployment & Testing Guide

## 🎯 Quick Start Deployment

### Prerequisites Checklist
- [ ] Node.js 16+ installed
- [ ] MongoDB running (local or Atlas)
- [ ] Polygon wallet with test MATIC
- [ ] Git repository access
- [ ] Code editor (VS Code recommended)

---

## Phase 1: Deploy Smart Contracts (~15 minutes)

### 1.1 Get Test MATIC
```bash
# Visit Mumbai Faucet
https://faucet.polygon.technology/

# Select "Mumbai" network
# Enter your wallet address
# Receive 0.5 test MATIC
```

### 1.2 Configure Blockchain Environment
```bash
cd blockchain
cp .env.example .env
```

Edit `blockchain/.env`:
```bash
POLYGON_RPC_URL=https://rpc-mumbai.maticvigil.com
PRIVATE_KEY=your_private_key_here  # From MetaMask
POLYGONSCAN_API_KEY=your_api_key    # From polygonscan.com
```

### 1.3 Deploy to Mumbai Testnet
```bash
cd blockchain
npm install
npx hardhat compile

# Deploy
npx hardhat run scripts/deploy.js --network mumbai
```

**Save the output!** You'll get:
```
OrderContract deployed to: 0x1234...
Transaction hash: 0xabcd...
```

### 1.4 Verify Contract (Optional)
```bash
npx hardhat verify --network mumbai <CONTRACT_ADDRESS>
```

Visit: `https://mumbai.polygonscan.com/address/<CONTRACT_ADDRESS>`

---

## Phase 2: Configure Backend (~10 minutes)

### 2.1 Update Backend Environment
```bash
cd server
```

Edit `server/.env`:
```bash
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_connection_string

# JWT Secret (generate new one for production!)
JWT_SECRET=your_jwt_secret_here

# Blockchain Configuration
BLOCKCHAIN_ENABLED=true
POLYGON_RPC_URL=https://rpc-mumbai.maticvigil.com
PRIVATE_KEY=your_backend_wallet_private_key
CONTRACT_ADDRESS_ORDER=0x...  # From Step 1.3
POLYGONSCAN_API_KEY=your_api_key
```

### 2.2 Install Dependencies & Start
```bash
cd server
npm install
node seed.js  # Seed test data
npm run dev
```

**Verify Backend Running:**
```bash
curl http://localhost:5000/
# Should return: "API is running..."
```

Check console for:
```
✅ Blockchain service initialized
✅ OrderContract loaded at: 0x...
Server running on port 5000
```

---

## Phase 3: Configure Frontend (~5 minutes)

### 3.1 Start Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend should open at: `http://localhost:5173`

### 3.2 Test Accounts
Login with these test accounts (from seed.js):

| Role | Email | Password |
|------|-------|----------|
| Customer | customer@test.com | customer123 |
| Farmer | farmer@test.com | farmer123 |
| Admin | admin@croplink.com | admin123 |

---

## Phase 4: End-to-End Testing

### Test 1: Wallet Creation (Customer) ✅

1. Login as customer (`customer@test.com` / `customer123`)
2. Click "Wallet" in navigation
3. Click "Create Wallet"
4. **IMPORTANT**: Save the 12-word recovery phrase
5. Click "I've Saved It Securely"
6. Verify wallet address and balance display

**Expected Result:**
- Wallet created successfully
- Address shown (0x...)
- Balance: 0 MATIC
- QR code displays

---

### Test 2: Get Test MATIC ✅

1. In wallet page, copy wallet address
2. Visit https://faucet.polygon.technology/
3. Select "Mumbai"
4. Paste address and get tokens
5. Wait 30 seconds
6. Click refresh button in wallet
7. Balance should update (~0.5 MATIC)

---

### Test 3: View Wallet on Polygonscan ✅

1. Click "View on Explorer" link
2. Should open Mumbai Polygonscan
3. Verify address matches
4. See faucet transaction in history

---

### Test 4: Browse & Add to Cart ✅

1. Go to "Marketplace"
2. Browse products
3. Add items to cart
4. View cart
5. Proceed to checkout

---

### Test 5: Crypto Payment (NOT YET IMPLEMENTED)

> **Note**: This requires order-blockchain integration which is in the backend but needs frontend connection.

**When implemented, flow will be:**
1. In checkout, select "Pay with Crypto"
2. Review: product cost + platform fee (2%) + gas
3. Click "Pay Now"
4. Transaction sent to blockchain
5. Order created with blockchain hash
6. View order on Polygonscan

---

### Test 6: Farmer Wallet ✅

1. Logout
2. Login as farmer (`farmer@test.com`)
3. Navigate to Wallet
4. Create wallet
5. Receive test MATIC
6. Verify balance

---

### Test 7: Transaction History ✅

1. In Wallet page
2. View should show faucet transaction
3. Click transaction to see details
4. Verify "View on Explorer" works

---

## Phase 5: Android Testing (When Implemented)

### Prerequisites
- Android Studio installed
- Android device/emulator
- Follow `ANDROID_BLOCKCHAIN_GUIDE.md`

### Test Flow
1. Install app on device
2. Login as customer
3. Navigate to Wallet
4. Create wallet
5. Backup recovery phrase
6. View QR code
7. Get test MATIC
8. Check balance updates
9. View transaction history

---

## Common Issues & Solutions

### Issue: "OrderContract not loaded"
**Solution:**
- Check `CONTRACT_ADDRESS_ORDER` in server/.env
- Verify contract deployed successfully
- Restart backend server

### Issue: "Blockchain service not initialized"
**Solution:**
- Set `BLOCKCHAIN_ENABLED=true` in .env
- Check `POLYGON_RPC_URL` is accessible
- Verify `PRIVATE_KEY` is set

### Issue: "Insufficient funds" when deploying
**Solution:**
- Get more test MATIC from faucet
- Wait a few minutes and try again

### Issue: Wallet creation fails
**Solution:**
- Check backend logs
- Verify MongoDB connection
- Ensure JWT token is valid

### Issue: Balance doesn't update
**Solution:**
- Click refresh button
- Check RPC URL is responsive
- Verify wallet has transactions on Polygonscan

---

## Production Deployment Checklist

> **⚠️ BEFORE deploying to mainnet:**

### Security
- [ ] Generate new JWT_SECRET (never use development key)
- [ ] Use environment-specific private keys
- [ ] Enable HTTPS only
- [ ] Set up proper CORS origins
- [ ] Audit smart contracts
- [ ] Test extensively on Mumbai testnet

### Smart Contracts
- [ ] Deploy to Polygon mainnet (costs real MATIC)
- [ ] Verify contracts on Polygonscan
- [ ] Test all contract functions
- [ ] Document contract addresses

### Backend
- [ ] Set `NODE_ENV=production`
- [ ] Use production MongoDB (MongoDB Atlas)
- [ ] Update `POLYGON_RPC_URL` to mainnet
- [ ] Set proper `PRIVATE_KEY` (production wallet)
- [ ] Configure email service
- [ ] Set up logging (Winston, Sentry)
- [ ] Enable rate limiting
- [ ] Set up SSL/TLS

### Frontend
- [ ] Build production bundle (`npm run build`)
- [ ] Update API_URL to production backend
- [ ] Deploy to hosting (Vercel, Netlify)
- [ ] Configure custom domain
- [ ] Enable CDN
- [ ] Test on multiple browsers

### Android
- [ ] Update BASE_URL to production
- [ ] Sign APK with release key
- [ ] Test on multiple devices
- [ ] Prepare for Play Store submission

### Monitoring
- [ ] Set up uptime monitoring
- [ ] Configure error tracking
- [ ] Monitor blockchain transactions
- [ ] Set up alerts for failures

---

## Performance Benchmarks

**Expected Response Times:**

| Operation | Time |
|-----------|------|
| Wallet Creation | 1-2 seconds |
| Balance Check | 0.5-1 second |
| Transaction Confirmation | 10-30 seconds |
| Smart Contract Call | 2-5 seconds |

**Gas Costs (Mumbai):**
- Order Creation: ~0.01 MATIC (~$0.01)
- Status Update: ~0.005 MATIC
- Order Completion: ~0.008 MATIC

**Mainnet Costs:**
- Order Creation: ~$0.01-0.05
- Status Update: ~$0.005-0.02
- Order Completion: ~$0.01-0.03

---

## Backup & Recovery

### Smart Contracts
- Contracts are immutable once deployed
- Keep deployment info in `deployment-info.json`
- Backup ABIs in version control

### Wallets
**Critical**: Users MUST backup their recovery phrases!
- 12-word mnemonic is shown only once
- No recovery without mnemonic
- Educate users on security

### Database
- Regular MongoDB backups
- Store wallet addresses (public info)
- Never store private keys in DB
- Encrypted private keys only for backend-managed wallets

---

## Monitoring & Logs

### Check Backend Logs
```bash
cd server
npm run dev  # Development
pm2 logs    # Production
```

### Check Frontend Logs
- Open browser DevTools → Console
- Look for API errors
- Check network tab for failed requests

### Check Blockchain Status
- Visit Polygonscan
- Search for contract address
- View recent transactions
- Monitor gas usage

---

## Next Steps After Deployment

1. **Complete Android Implementation**
   - Follow `ANDROID_BLOCKCHAIN_GUIDE.md`
   - ~4 hours of development
   - Test thoroughly

2. **Integrate Order-Blockchain Flow**
   - Connect checkout to blockchain payment
   - Update order pages with blockchain status
   - Test end-to-end order placement

3. **Security Audit**
   - Review smart contracts
   - Test wallet storage security
   - Verify API authentication
   - Check for vulnerabilities

4. **User Testing**
   - Invite beta testers
   - Gather feedback
   - Fix issues
   - Iterate on UX

5. **Mainnet Deployment**
   - Follow production checklist above
   - Start with small test transactions
   - Monitor closely
   - Scale gradually

---

## Support & Resources

**Documentation:**
- [BLOCKCHAIN_SETUP.md](file:///d:/Projects%202025/Final%20Year%20projects/CropLink/BLOCKCHAIN_SETUP.md) - Smart contract deployment
- [USER_WALLET_GUIDE.md](file:///d:/Projects%202025/Final%20Year%20projects/CropLink/USER_WALLET_GUIDE.md) - User-facing guide
- [ANDROID_BLOCKCHAIN_GUIDE.md](file:///d:/Projects%202025/Final%20Year%20projects/CropLink/ANDROID_BLOCKCHAIN_GUIDE.md) - Android implementation

**External Resources:**
- Polygon Docs: https://docs.polygon.technology/
- Web3j Docs: https://docs.web3j.io/
- Hardhat Docs: https://hardhat.org/
- ethers.js Docs: https://docs.ethers.org/

**Get Help:**
- Check console/logs first
- Review error messages
- Search documentation
- Test on Mumbai testnet before mainnet

---

## Success Criteria

Your blockchain integration is successful when:

✅ Smart contracts deployed and verified
✅ Backend connects to Polygon network  
✅ Wallets can be created on Web
✅ Balances update correctly
✅ Transactions visible on Polygonscan
✅ QR codes generate properly
✅ Users can backup recovery phrases
✅ No private keys exposed
✅ All tests pass
✅ Ready for Android completion

**Current Status: ~70% Complete** 🎉

**Remaining: Android UI (~30%) + Testing**

---

**You're almost there! Great work! 🚀**
