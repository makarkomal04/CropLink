# Android Blockchain Integration Guide

## Current Status: Foundation Complete ✅

### What's Already Done

**Dependencies Added (build.gradle.kts):**
```kotlin
// Blockchain - Web3j
implementation("org.web3j:core:4.10.3")

// QR Code generation and scanning  
implementation("com.google.zxing:core:3.5.2")
implementation("com.journeyapps:zxing-android-embedded:4.3.0")

// OkHttp (required by Web3j)
implementation("com.squareup.okhttp3:okhttp:4.12.0")
```

**Models Created:**
- ✅ `Wallet.java` - Wallet data model
- ✅ `Transaction.java` - Transaction data model

**Backend API Ready:**
- ✅ Wallet creation endpoint: `POST /api/blockchain/wallet/create`
- ✅ Wallet info endpoint: `GET /api/blockchain/wallet/:userId`
- ✅ Balance endpoint: `GET /api/blockchain/wallet/:userId/balance`
- ✅ Transactions endpoint: `GET /api/blockchain/transactions/:userId`

---

## Next Steps: Implementation Guide

### Step 1: Create BlockchainService.java

**File:** `android/app/src/main/java/com/croplink/blockchain/BlockchainService.java`

**Purpose:** Singleton service for blockchain API calls

**Key Methods Needed:**
```java
- createWallet(Context, CreateWalletCallback)
- getWalletInfo(Context, String userId, WalletCallback)
- getBalance(Context, String userId, BalanceCallback)
- getTransactions(Context, String userId, TransactionsCallback)
```

**Implementation Approach:**
- Use Retrofit for API calls to backend
- Store wallet data in SharedPreferences
- Handle async operations with callbacks

---

### Step 2: Create WalletManager.java

**File:** `android/app/src/main/java/com/croplink/blockchain/WalletManager.java`

**Purpose:** Secure wallet storage using Android KeyStore

**Key Methods:**
```java
- saveWalletAddress(Context, String address)
- getWalletAddress(Context): String
- saveMnemonic(Context, String mnemonic) // Encrypted
- hasSavedWallet(Context): boolean
```

**Security Note:** Use Android KeyStore for encryption, never store mnemonic in plain text

---

### Step 3: Create WalletActivity.java

**File:** `android/app/src/main/java/com/croplink/customer/WalletActivity.java`

**Layout:** `res/layout/activity_wallet.xml`

**UI Components:**
- Wallet address display with copy button
- Balance display (MATIC)
- QR code for receiving
- "Receive" and "Transactions" buttons  
- Refresh balance button

**Flow:**
1. Check if wallet exists (WalletManager)
2. If not → Show "Create Wallet" button
3. If yes → Display wallet info, balance, QR code

---

### Step 4: Create Wallet UI (activity_wallet.xml)

**Layout Structure:**
```xml
<ScrollView>
  <LinearLayout>
    <!-- Header -->
    <TextView>My Wallet</TextView>
    
    <!-- Wallet Card -->
    <CardView>
      <TextView>Address: 0x...</TextView>
      <Button>Copy</Button>
      <TextView>Balance: X.XX MATIC</TextView>
      <Button>Refresh</Button>
    </CardView>
    
    <!-- QR Code -->
    <ImageView id="qrCodeImage"/>
    
    <!-- Actions -->
    <Button>View Transactions</Button>
    <Button>Get Test MATIC</Button>
  </LinearLayout>
</ScrollView>
```

---

### Step 5: Implement Wallet Creation Flow

**CreateWalletActivity.java** (Optional separate activity)

**Flow:**
1. User clicks "Create Wallet"
2. Call `BlockchainService.createWallet()`
3. Backend returns: `{ walletAddress, mnemonic }`
4. **Show Mnemonic Screen** (CRITICAL)
   - Display 12 words in grid
   - "Copy" and "Download" buttons
   - Warning text about backup
   - "I've Saved It" confirmation button
5. Save address to WalletManager
6. Navigate to WalletActivity

**IMPORTANT:** Mnemonic shown only once during creation!

---

### Step 6: Implement QR Code Generation

**In WalletActivity.java:**

```java
private void generateQRCode(String walletAddress) {
    try {
        BarcodeEncoder barcodeEncoder = new BarcodeEncoder();
        Bitmap bitmap = barcodeEncoder.encodeBitmap(
            walletAddress, 
            BarcodeFormat.QR_CODE, 
            400, 
            400
        );
        qrCodeImageView.setImageBit map(bitmap);
    } catch (Exception e) {
        Toast.makeText(this, "QR generation failed", Toast.LENGTH_SHORT).show();
    }
}
```

---

### Step 7: Create TransactionHistoryActivity.java

**File:** `android/app/src/main/java/com/croplink/customer/TransactionHistoryActivity.java`

**Layout:** `res/layout/activity_transaction_history.xml` (RecyclerView)

**Features:**
- List all transactions (sent/received)
- Show: amount, date, status
- Click transaction → view on Polygonscan
- Pull to refresh

**Adapter:** `TransactionAdapter.java`

---

### Step 8: Update Order Models

**In Order.java, add:**
```java
private String blockchainTxHash;
private String blockchainOrderId;
private boolean onBlockchain;
private String paymentTxHash;

// Getters and setters...
```

---

### Step 9: Update MyOrdersActivity.java

**Add blockchain status display:**
- Show blockchain icon if `onBlockchain == true`  
- Display transaction hash
- "View on Explorer" button (opens Polygonscan)

---

### Step 10: Add Wallet to Navigation Menu

**Update main navigation drawer/menu:**
- Add "Wallet" menu item
- Intent to WalletActivity
- Show for all user roles (customer, farmer, admin)

---

## Estimated Time Per Step

| Step | Task | Time |
|------|------|------|
| 1 | BlockchainService.java | 30 min |
| 2 | WalletManager.java | 20 min |
| 3 | WalletActivity.java | 45 min |
| 4 | activity_wallet.xml | 30 min |
| 5 | Wallet Creation Flow | 40 min |
| 6 | QR Code Generation | 15 min |
| 7 | TransactionHistoryActivity | 35 min |
| 8 | Update Order Models | 10 min |
| 9 | Update MyOrdersActivity | 20 min |
| 10 | Navigation Updates | 15 min |
| **TOTAL** | | **~4 hours** |

---

## Testing Checklist

After implementation:

- [ ] Create wallet successfully
- [ ] Mnemonic displayed and can be copied/downloaded
- [ ] Wallet address displayed correctly
- [ ] QR code generates properly
- [ ] Balance updates from backend
- [ ] Transaction history loads
- [ ] "View on Explorer" opens Polygonscan
- [ ] Wallet persists across app restarts
- [ ] Secure storage verified (no plain text mnemonic)

---

## Code Starters

### BlockchainService.java (Starter)

```java
package com.croplink.blockchain;

import android.content.Context;
import com.croplink.models.Wallet;
import com.croplink.models.Transaction;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class BlockchainService {
    private static BlockchainService instance;
    private static final String BASE_URL = "http://10.0.2.2:5000/api/"; // Android emulator localhost
    
    private BlockchainService() {}
    
    public static BlockchainService getInstance() {
        if (instance == null) {
            instance = new BlockchainService();
        }
        return instance;
    }
    
    public void createWallet(Context context, final CreateWalletCallback callback) {
        // TODO: Implement API call
        // Use Retrofit to POST /blockchain/wallet/create
        // Get token from SessionManager
        // Return walletAddress and mnemonic via callback
    }
    
    public void getWalletInfo(Context context, String userId, final WalletCallback callback) {
        // TODO: Implement API call
        // GET /blockchain/wallet/{userId}
    }
    
    // Callback interfaces
    public interface CreateWalletCallback {
        void onSuccess(String walletAddress, String mnemonic);
        void onError(String error);
    }
    
    public interface WalletCallback {
        void onSuccess(Wallet wallet);
        void onError(String error);
    }
}
```

### WalletManager.java (Starter)

```java
package com.croplink.blockchain;

import android.content.Context;
import android.content.SharedPreferences;
import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyProperties;
import java.security.KeyStore;
import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;

public class WalletManager {
    private static final String PREFS_NAME = "WalletPrefs";
    private static final String KEY_WALLET_ADDRESS = "wallet_address";
    private static final String KEY_MNEMONIC_ENCRYPTED = "mnemonic_encrypted";
    
    public static void saveWalletAddress(Context context, String address) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        prefs.edit().putString(KEY_WALLET_ADDRESS, address).apply();
    }
    
    public static String getWalletAddress(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        return prefs.getString(KEY_WALLET_ADDRESS, null);
    }
    
    public static boolean hasSavedWallet(Context context) {
        return getWalletAddress(context) != null;
    }
    
    // TODO: Implement encryption using Android KeyStore
    public static void saveMnemonic(Context context, String mnemonic) {
        // Encrypt mnemonic using KeyStore
        // Save encrypted version to SharedPreferences
    }
}
```

---

## Resources

**Documentation:**
- Web3j Android: https://docs.web3j.io/4.9.0/android/
- Android KeyStore: https://developer.android.com/training/articles/keystore
- ZXing QR: https://github.com/journeyapps/zxing-android-embedded

**API Base URLs:**
- Emulator: `http://10.0.2.2:5000/api/`
- Physical Device: `http://YOUR_IP:5000/api/`
- Production: Update to actual backend URL

**Polygon Mumbai Testnet:**
- Explorer: https://mumbai.polygonscan.com/
- Faucet: https://faucet.polygon.technology/

---

## Summary

**✅ Completed:**
- Dependencies added (Web3j, ZXing, OkHttp)
- Model classes created (Wallet, Transaction)
- Backend API ready

**⏳ Remaining:**
- 10 implementation steps (~4 hours)
- Testing and refinement

The foundation is solid. Follow the steps above to complete Android blockchain integration!

---

**Good luck! 🚀**
