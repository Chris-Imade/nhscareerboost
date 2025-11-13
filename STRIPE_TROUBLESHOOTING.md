# Stripe Card Element Troubleshooting Guide

## Issue: Card Details Field Appears Disabled

### Common Causes & Solutions

#### 1. **Modal Visibility Issue** ✓ FIXED
**Problem:** Stripe card element was mounting when the modal was hidden, causing it to appear disabled.

**Solution Implemented:**
- Added unmount/remount logic when the modal opens
- Card element now properly initializes when visible

#### 2. **Test vs Live Keys**
**Current Setup:** Using test key for localhost development
```javascript
const API_BASE_URL = 'http://localhost:3000';
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51RMAlgD8x0lOeX6H...';
```

**Important:** 
- Test keys work with test card numbers only
- Live keys require real card details
- Make sure backend is also using matching test/live secret key

#### 3. **Test Card Numbers**
When using test mode, use these card numbers:

| Card Number | Description |
|-------------|-------------|
| 4242 4242 4242 4242 | Successful payment |
| 4000 0025 0000 3155 | Requires authentication (3D Secure) |
| 4000 0000 0000 9995 | Declined - insufficient funds |

- **Expiry:** Any future date (e.g., 12/25)
- **CVC:** Any 3 digits (e.g., 123)
- **ZIP:** Any 5 digits (e.g., 12345)

#### 4. **Browser Console Checks**

Open browser console (F12) and look for these messages:

**Success Messages:**
```
Consultation page loaded
Initializing Stripe with key: pk_test_51RMAlgD8x0l...
Card element created, attempting to mount...
Stripe initialized successfully
Stripe card element is ready and interactive
```

**Error Messages to Watch For:**
- `Stripe.js not loaded` - Script blocked or failed to load
- `Card element container #card-element not found` - HTML structure issue
- `Error initializing Stripe` - Invalid API key or network issue

#### 5. **Network/CORS Issues**

If using localhost backend, ensure:
```javascript
// Backend CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
```

#### 6. **Ad Blockers & Privacy Extensions**

Some browser extensions may block Stripe:
- Disable ad blockers temporarily
- Disable privacy extensions (Privacy Badger, uBlock Origin)
- Try in incognito/private mode

#### 7. **SSL/HTTPS Requirements**

Stripe requires HTTPS in production:
- ✅ Localhost (http://localhost) is allowed for testing
- ✅ Production must use HTTPS
- ❌ HTTP on non-localhost domains will fail

## Testing Steps

### Step 1: Open Browser Console
1. Open consultation.html in browser
2. Press F12 to open Developer Tools
3. Go to Console tab

### Step 2: Check Initial Load
Look for these console messages:
```
Consultation page loaded
Initializing Stripe with key: pk_test_...
Stripe initialized successfully
```

### Step 3: Open Payment Modal
1. Select a service
2. Click "Pay Securely with Stripe"
3. Modal should open
4. Check console for: `Stripe card element is ready and interactive`

### Step 4: Test Card Input
1. Click in the card number field
2. Type: 4242 4242 4242 4242
3. Field should accept input and show card brand icon
4. Enter expiry: 12/25
5. Enter CVC: 123

### Step 5: Submit Payment
1. Fill in name and email
2. Click "Complete Payment"
3. Check console for payment processing messages

## Quick Fix Checklist

- [ ] Browser console shows no errors
- [ ] Stripe.js script is loading (check Network tab)
- [ ] Using correct API key (test key for localhost)
- [ ] Backend server is running on http://localhost:3000
- [ ] Modal opens when clicking payment button
- [ ] Card element shows placeholder text
- [ ] Can click and type in card field
- [ ] No ad blockers interfering
- [ ] Backend has matching Stripe secret key

## Backend Verification

Ensure your backend has the matching secret key:

```javascript
// Backend - must match frontend key type
const stripe = require('stripe')('sk_test_51RMAlgD8x0lOeX6H...');
// Note: sk_test_ for test, sk_live_ for production
```

## Still Not Working?

1. **Check browser console** for specific error messages
2. **Verify backend is running**: Visit http://localhost:3000 in browser
3. **Test Stripe connection**: 
   ```bash
   curl https://api.stripe.com/v1/charges \
     -u pk_test_51RMAlgD8x0lOeX6H...:
   ```
4. **Clear browser cache** and reload page
5. **Try different browser** to rule out extension conflicts

## Contact Support

If issue persists, provide:
- Browser console logs (full output)
- Network tab showing Stripe API calls
- Backend server logs
- Browser and OS version
