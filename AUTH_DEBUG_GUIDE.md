# Quick Authentication Test

## Test Login via Browser Console

1. Open your browser at http://localhost:5173
2. Press `F12` to open Developer Tools
3. Go to the **Console** tab
4. Paste this code and press Enter:

```javascript
// Test login
fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'customer@test.com',
    password: 'customer123'
  })
})
.then(res => res.json())
.then(data => {
  console.log('Login Response:', data);
  
  // Save to localStorage
  localStorage.setItem('user', JSON.stringify(data));
  console.log('Saved to localStorage!');
  
  // Verify it's saved
  const saved = localStorage.getItem('user');
  console.log('Retrieved from storage:', JSON.parse(saved));
  
  // Check token
  const token = JSON.parse(saved).token;
  console.log('Token:', token);
})
.catch(err => console.error('Error:', err));
```

5. Check the console output - you should see:
   - Login Response with `_id`, `name`, `email`, `role`, `token`
   - "Saved to localStorage!"
   - Retrieved data
   - The JWT token

## Check LocalStorage Manually

1. In DevTools, go to **Application** tab
2. Expand **Local Storage** on the left
3. Click `http://localhost:5173`
4. Look for a key called `user`
5. Click on it to see the value
6. You should see JSON with:
   ```json
   {
     "_id": "...",
     "name": "Customer Test",
     "email": "customer@test.com",
     "role": "customer",
     "token": "eyJhbGc..."
   }
   ```

## If Token is Missing

If you see the user object but NO `token` field:

**Backend Issue:** The backend isn't returning the token
- Check server logs for errors
- Verify JWT_SECRET is set in server/.env

## If Nothing is Saved

If localStorage is completely empty:

**Frontend Issue:** Login isn't completing
1. Check browser console for errors
2. Verify backend is running on port 5000
3. Check CORS settings

## Test Wallet Creation After Login

Once you confirm token is saved, try wallet creation:

```javascript
// In browser console after login
const user = JSON.parse(localStorage.getItem('user'));
const token = user.token;

fetch('http://localhost:5000/api/blockchain/wallet/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
})
.then(res => res.json())
.then(data => console.log('Wallet Created:', data))
.catch(err => console.error('Wallet Error:', err));
```

Should return:
```json
{
  "message": "Wallet created successfully",
  "walletAddress": "0x...",
  "mnemonic": "word1 word2 word3..."
}
```

---

## Quick Fix Commands

If you want to manually set a token for testing:

```javascript
// Fake user object with token for testing
const testUser = {
  _id: "test123",
  name: "Test User",
  email: "test@test.com",
  role: "customer",
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3OGNmYzc5ZDdkZjk5MGRhNTgyNWRiMSIsImlhdCI6MTczNzQwMjQ2OCwiZXhwIjoxNzQwMDgwNDY4fQ.test"
};

localStorage.setItem('user', JSON.stringify(testUser));
console.log('Test user saved!');
```

Then refresh the page - you should be "logged in" (though API calls will fail without a real token).
