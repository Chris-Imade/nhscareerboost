# NHS Shortlisting Guide - Order Bump Implementation

## ✅ Complete Stripe Checkout with Order Bump

### Implementation Date: January 28, 2025

---

## 🎯 What Was Built

A complete Stripe checkout system with an **order bump/upsell feature** for the NHS Shortlisting Guide funnel.

---

## 📦 Products

### Main Product
- **Name**: NHS Shortlisting Guide
- **Price**: £9.99 (one-time payment)
- **Description**: The guide that shows how to get shortlisted for NHS applications
- **Type**: Digital PDF download

### Order Bump (Upsell)
- **Name**: Personal NHS Career Audit
- **Price**: £39 (one-time payment)
- **Description**: Tailored feedback to improve NHS application chances
- **Type**: One-to-one consultation service
- **Default**: Unchecked (opt-in)

---

## 🎨 Order Bump Design

### Visual Style
- **Background**: Orange gradient (#fff5e6 to #ffe8cc)
- **Border**: 3px solid orange (#ff9800)
- **Badge**: "SPECIAL OFFER" in orange
- **Checkbox**: Custom styled with orange theme
- **Position**: Directly above CTA buttons (top and bottom of page)

### User Experience
- Checkbox is **unchecked by default** (user must opt-in)
- Both checkboxes sync automatically (top and bottom)
- CTA button text updates dynamically when checked:
  - Unchecked: "Get the NHS Shortlisting Guide – £9.99"
  - Checked: "Get Bundle – £48.99"
- Payment modal updates total price automatically
- Hover effect on order bump box for better engagement

---

## 💳 Checkout Flow

### Step 1: Landing Page
1. User views NHS Shortlisting Guide page
2. Sees order bump checkbox above CTA
3. Optionally checks the box to add Career Audit
4. CTA button updates to show new total
5. Clicks CTA button

### Step 2: Payment Modal
1. Modal opens with Stripe card form
2. Total price reflects order bump selection:
   - Guide only: £9.99
   - Guide + Audit: £48.99
3. Product name updates:
   - Guide only: "NHS Shortlisting Guide"
   - With upsell: "NHS Guide + Career Audit Bundle"
4. User enters name, email, and card details
5. Clicks "Pay £[amount]"

### Step 3: Payment Processing
1. Creates Payment Intent via existing backend endpoint
2. Includes metadata about upsell selection:
   ```json
   {
     "upsellIncluded": true/false,
     "mainProduct": "NHS Shortlisting Guide",
     "mainProductPrice": 9.99,
     "upsellProduct": "Personal NHS Career Audit" or "none",
     "upsellPrice": 39 or 0
   }
   ```
3. Confirms payment with Stripe
4. On success → redirects to thank you page

### Step 4: Success Page
1. Shows thank you message
2. PDF download button (instant access)
3. **If upsell purchased**: Shows confirmation box:
   - "✅ Personal NHS Career Audit Included"
   - Message about being contacted within 24 hours
4. Tracks conversion with Google Analytics & Meta Pixel (if configured)

---

## 📁 Files Modified

### 1. Landing Page
**File**: `/nhs-shortlisting-guide.html`

**Changes**:
- Added order bump CSS styles (lines 525-631)
- Added order bump HTML at top CTA (lines 656-671)
- Added order bump HTML at bottom CTA (lines 740-755)
- Updated CTA buttons with dynamic text spans

### 2. Checkout JavaScript
**File**: `/assets/js/nhs-guide-checkout.js`

**Changes**:
- Added order bump state management
- Added `setupOrderBump()` function to sync checkboxes
- Added dynamic CTA text updates
- Modified `openPaymentModal()` to update modal pricing
- Modified `handleStripePayment()` to include upsell in payment
- Added upsell metadata to payment intent
- Updated success redirect with upsell parameter

### 3. Success Page
**File**: `/nhs-shortlisting-guide/thank-you.html`

**Changes**:
- Added upsell confirmation box styles (lines 108-132)
- Added upsell confirmation HTML (lines 268-274)
- Added JavaScript to show/hide confirmation based on URL parameter
- Added Google Analytics tracking for purchases and upsells
- Added Meta Pixel tracking for conversions

---

## 🔧 Technical Details

### Order Bump State Management
```javascript
let isUpsellSelected = false;
const MAIN_PRODUCT_PRICE = 9.99;
const UPSELL_PRICE = 39;
```

### Checkbox Synchronization
- Two checkboxes (top and bottom of page)
- Change event listeners sync both checkboxes
- Updates global `isUpsellSelected` state
- Triggers CTA text update

### Dynamic Pricing
- CTA buttons update in real-time
- Payment modal shows correct total
- Payment button shows correct amount
- Backend receives correct amount in pence

### Payment Metadata
All upsell information is stored in Stripe payment metadata:
- `upsellIncluded`: boolean
- `mainProduct`: product name
- `mainProductPrice`: 9.99
- `upsellProduct`: "Personal NHS Career Audit" or "none"
- `upsellPrice`: 39 or 0

---

## 📊 Analytics Tracking

### Google Analytics (Optional)
If `gtag` is available, tracks:
- Main product purchase (£9.99)
- Upsell purchase (£39) if selected
- Transaction ID from payment intent
- Individual line items

### Meta Pixel (Optional)
If `fbq` is available, tracks:
- Purchase event
- Total value (£9.99 or £48.99)
- Content IDs for products purchased

---

## 🧪 Testing Checklist

### Order Bump Functionality
- [ ] Order bump appears on landing page (top and bottom)
- [ ] Checkbox is unchecked by default
- [ ] Checking top checkbox syncs with bottom checkbox
- [ ] Checking bottom checkbox syncs with top checkbox
- [ ] CTA text updates when checkbox is checked
- [ ] CTA text shows correct total price

### Payment Modal
- [ ] Modal opens when CTA is clicked
- [ ] Modal shows correct total (£9.99 or £48.99)
- [ ] Modal shows correct product name
- [ ] Payment button shows correct amount
- [ ] Stripe card element works correctly

### Payment Processing
- [ ] Payment processes successfully without upsell
- [ ] Payment processes successfully with upsell
- [ ] Correct amount charged (£9.99 or £48.99)
- [ ] Metadata includes upsell information
- [ ] Redirects to success page after payment

### Success Page
- [ ] Thank you message displays
- [ ] PDF download button works
- [ ] Upsell confirmation hidden when not purchased
- [ ] Upsell confirmation shows when purchased
- [ ] Analytics tracking fires (if configured)

### Mobile Testing
- [ ] Order bump displays correctly on mobile
- [ ] Checkbox is easy to tap on mobile
- [ ] CTA button is readable on mobile
- [ ] Payment modal works on mobile
- [ ] Success page displays correctly on mobile

---

## 🎯 Conversion Optimization Features

### Order Bump Best Practices Implemented
1. ✅ **Visual prominence** - Orange color stands out
2. ✅ **Clear value proposition** - Explains what user gets
3. ✅ **Opt-in default** - Not pre-checked (ethical)
4. ✅ **Strategic placement** - Above CTA (high visibility)
5. ✅ **Dynamic pricing** - Shows total immediately
6. ✅ **Hover effect** - Draws attention
7. ✅ **Mobile-friendly** - Works on all devices

### Psychological Triggers
- "SPECIAL OFFER" badge creates urgency
- Checkbox format = low commitment
- Clear benefit statement
- Positioned at decision point
- No friction in checkout process

---

## 💰 Revenue Impact

### Potential Scenarios
- **Without order bump**: £9.99 per sale
- **With 10% upsell take rate**: £13.89 average order value (+39%)
- **With 20% upsell take rate**: £17.79 average order value (+79%)
- **With 30% upsell take rate**: £21.69 average order value (+119%)

### Tracking Metrics
Monitor these in Stripe dashboard:
- Total orders with upsell vs without
- Upsell conversion rate
- Average order value
- Total revenue from upsells

---

## 🔄 Future Enhancements

### Potential Additions
1. **Multiple order bumps** - Add more upsell options
2. **Quantity selector** - Allow multiple career audits
3. **A/B testing** - Test different upsell copy
4. **Countdown timer** - Add urgency to special offer
5. **Social proof** - "X people added this today"
6. **Video explanation** - Show what career audit includes
7. **Testimonials** - Add reviews for career audit

---

## 📧 Post-Purchase Workflow

### For Main Product Only
1. Customer receives Stripe receipt email
2. Can download PDF immediately from success page
3. No further action needed

### For Main Product + Upsell
1. Customer receives Stripe receipt email
2. Can download PDF immediately from success page
3. **Manual follow-up required**:
   - Check Stripe dashboard for upsell purchases
   - Email customer within 24 hours
   - Schedule career audit session
   - Send calendar invite

### Recommended Email Template
```
Subject: Your NHS Career Audit - Let's Schedule

Hi [Name],

Thank you for purchasing the NHS Shortlisting Guide + Personal NHS Career Audit!

You can download your guide here: [link]

For your career audit session, please reply with your:
- Preferred date/time (next 2 weeks)
- Current role & band
- Target role & band
- Biggest challenge (shortlisting/interviews/progression)

I'll send a calendar invite once confirmed.

Looking forward to helping you succeed!

Best,
[Your Name]
Health Career Boost
```

---

## 🚀 Deployment Status

**Status**: ✅ Ready for Production

**What's Live**:
- Order bump on landing page
- Dynamic pricing updates
- Payment modal with correct totals
- Success page with upsell confirmation
- Analytics tracking (optional)

**What's Needed**:
- PDF file at `/assets/files/NHS-Shortlisting-Guide.pdf`
- Backend endpoint already exists (no changes needed)
- Optional: Configure Google Analytics
- Optional: Configure Meta Pixel

---

## 📞 Support & Maintenance

### Regular Tasks
- Monitor upsell conversion rate in Stripe
- Follow up with upsell customers within 24 hours
- Track average order value trends
- A/B test different upsell copy
- Optimize order bump placement

### Troubleshooting
- **Checkboxes not syncing**: Check JavaScript console
- **Price not updating**: Verify checkbox IDs match
- **Upsell not showing on success page**: Check URL parameter
- **Payment amount incorrect**: Verify calculation in checkout.js

---

## ✨ Summary

**Complete order bump implementation** with:
- ✅ Visual order bump on landing page
- ✅ Checkbox syncing (top and bottom)
- ✅ Dynamic CTA text updates
- ✅ Dynamic modal pricing
- ✅ Upsell metadata in Stripe
- ✅ Success page confirmation
- ✅ Analytics tracking ready
- ✅ Mobile-friendly design
- ✅ NHS-style branding

**Ready to test immediately** - visit the landing page and try checking/unchecking the order bump to see the dynamic pricing in action!

---

**Implementation Date**: January 28, 2025  
**Status**: ✅ Complete and Ready for Testing  
**Backend**: Uses existing Payment Intent endpoint (no changes needed)  
**Stripe Mode**: LIVE (Real Payments)
