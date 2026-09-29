# Blockchain Setup Guide

## Overview

This guide will help you deploy and configure the blockchain infrastructure for CropLink's order management and wallet features using Polygon (MATIC) network.

## Prerequisites

- Node.js 16+ installed
- Access to a Polygon wallet with some MATIC for deployment
- Optional: MetaMask for testing

## Step 1: Get Test MATIC

For testnet deployment, get free test MATIC tokens:

1. Visit [Polygon Mumbai Faucet](https://faucet.polygon.technology/)
2. Select "Mumbai" network
3. Enter your wallet address
4. Click "Submit" to receive test MATIC

## Step 2: Configure Environment Variables

In `blockchain/.env` (create if it doesn't exist):

```bash
POLYGON_RPC_URL=https://rpc-mumbai.maticvigil.com
PRIVATE_KEY=your_wallet_private_key_here
POLYGONSCAN_API_KEY=your_polygonscan_api_key
```

**⚠️ Security Warning:** Never commit your private key to version control!

To get Polygonscan API Key:
1. Visit [PolygonScan](https://polygonscan.com/)
2. Sign up for a free account
3. Go to API Keys section
4. Generate a new API key

## Step 3: Compile Smart Contracts

```bash
cd blockchain
npm install
npx hardhat compile
```

Expected output: `Compiled 1 Solidity file successfully`

## Step 4: Run Tests (Optional but Recommended)

```bash
npx hardhat test
```

This runs the comprehensive test suite with 15+ test cases.

## Step 5: Deploy to Mumbai Testnet

```bash
npx hardhat run scripts/deploy.js --network mumbai
```

**Save the output!** You'll see:
- Contract address (e.g., `0x1234...`)
- Transaction hash
- Deployment info saved to `deployment-info.json`

##Step 6: Verify Contract on Polygonscan

After deployment, verify your contract:

```bash
npx hardhat verify --network mumbai <CONTRACT_ADDRESS>
```

Replace `<CONTRACT_ADDRESS>` with your deployed contract address.

## Step 7: Update Backend Environment

In `server/.env`, update:

```bash
BLOCKCHAIN_ENABLED=true
CONTRACT_ADDRESS_ORDER=0x... # Your deployed contract address
POLYGON_RPC_URL=https://rpc-mumbai.maticvigil.com
PRIVATE_KEY=your_backend_wallet_private_key # For automated transactions
```

## Step 8: Restart Backend Server

```bash
cd server
npm run dev
```

Check console for: `✅ Blockchain service initialized`

## Testing Blockchain Integration

### Test Wallet Creation

```bash
curl -X POST http://localhost:5000/api/blockchain/wallet/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

Expected response:
```json
{
  "message": "Wallet created successfully",
  "walletAddress": "0x...",
  "mnemonic": "twelve word seed phrase..."
}
```

### Test Wallet Balance

```bash
curl http://localhost:5000/api/blockchain/wallet/me/balance \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Mainnet Deployment

**⚠️ Only after thorough testing!**

1. Get real MATIC tokens
2. Update `.env` to use mainnet RPC
3. Deploy with `--network polygon`
4. Update `POLYGON_RPC_URL` to mainnet in server `.env`

```bash
POLYGON_RPC_URL=https://polygon-rpc.com
```

## Troubleshooting

### "Insufficient funds" error
- Ensure wallet has enough MATIC for gas fees
- Check balance: `npx hardhat accounts --network mumbai`

### "Contract not found" error
- Verify `CONTRACT_ADDRESS_ORDER` is correct
- Check contract is deployed: visit Polygonscan

### "Blockchain service not initialized"
- Check `BLOCKCHAIN_ENABLED=true` in `.env`
- Verify RPC URL is accessible
- Check console for error messages

## Network Configuration

### Mumbai Testnet (Testing)
- RPC: `https://rpc-mumbai.maticvigil.com`
- Chain ID: 80001
- Block Explorer: https://mumbai.polygonscan.com/

### Polygon Mainnet (Production)
- RPC: `https://polygon-rpc.com`
- Chain ID: 137
- Block Explorer: https://polygonscan.com/

## Gas Price Optimization

Monitor gas prices:
- Mumbai: Usually ~1-8 Gwei
- Mainnet: Check https://polygonscan.com/gastracker

Adjust in `hardhat.config.js` if needed:
```javascript
mumbai: {
  gasPrice: 8000000000, // 8 Gwei
}
```

## Next Steps

After successful deployment:
1. Integrate Web Frontend (see implementation plan)
2. Integrate Android App (see implementation plan)
3. Test end-to-end order flow with blockchain
4. Monitor contract on Polygonscan

## Support

For issues:
- Check Hardhat documentation: https://hardhat.org/
- Polygon documentation: https://docs.polygon.technology/
- Review smart contract code in `contracts/OrderContract.sol`
