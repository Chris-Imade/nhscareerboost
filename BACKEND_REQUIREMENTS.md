# Backend Server Requirements - NHS Career Boost

## Overview
This document outlines all backend server requirements needed to support the NHS Career Boost website frontend. The backend should handle form submissions, payment processing, email notifications, and data storage.

---

## 1. Contact Form Endpoint

### **Endpoint**: `POST /api/contact`

### **Purpose**: 
Handle free consultation booking requests from the contact page.

### **Required Fields**:
```json
{
  "name": "string (required, max 100 chars)",
  "email": "string (required, valid email format)",
  "phone": "string (optional, max 20 chars)",
  "service": "string (required, one of: 'cv-review', 'supporting-statement', 'mock-interview', 'complete-package', 'general-inquiry')",
  "message": "string (optional, max 1000 chars)",
  "timestamp": "datetime (auto-generated)"
}
```

### **Validation Rules**:
- `name`: Required, minimum 2 characters, maximum 100 characters
- `email`: Required, must be valid email format
- `phone`: Optional, if provided must be valid UK phone format
- `service`: Required, must match one of the predefined service types
- `message`: Optional, maximum 1000 characters

### **Response**:
```json
{
  "success": true,
  "message": "Thank you! Your consultation request has been received. We'll contact you within 24 hours.",
  "reference_id": "CON-20231107-XXXXX"
}
```

### **Actions Required**:
1. Store submission in database
2. Send confirmation email to client
3. Send notification email to admin (daniel@nhscareerboost.co.uk)
4. Generate unique reference ID
5. Log submission for analytics

---

## 2. Consultation/Checkout Form Endpoints

### **2.1 Payment Intent Creation**

### **Endpoint**: `POST /api/payment/create-intent`

### **Purpose**: 
Create a Stripe payment intent for service booking.

### **Required Fields**:
```json
{
  "service": "string (required, one of: 'cv-review', 'supporting-statement', 'mock-interview', 'complete-package')",
  "amount": "number (required, in pence/cents)",
  "currency": "string (default: 'gbp')"
}
```

### **Service Pricing**:
```javascript
{
  "cv-review": 7500,           // £75.00
  "supporting-statement": 12500, // £125.00
  "mock-interview": 15000,      // £150.00
  "complete-package": 29500     // £295.00
}
```

### **Response**:
```json
{
  "success": true,
  "client_secret": "pi_xxxxxxxxxxxxx_secret_xxxxxxxxxxxxx",
  "payment_intent_id": "pi_xxxxxxxxxxxxx"
}
```

---

### **2.2 Booking Completion**

### **Endpoint**: `POST /api/booking/complete`

### **Purpose**: 
Complete booking after successful payment and collect client details.

### **Required Fields**:
```json
{
  "transaction_ref": "string (required, from payment)",
  "payment_intent_id": "string (required, Stripe payment intent ID)",
  "full_name": "string (required, max 100 chars)",
  "email": "string (required, valid email)",
  "phone": "string (required, UK format)",
  "service": "string (required, service type)",
  "current_band": "string (optional, e.g., 'Band 5', 'Band 6')",
  "target_role": "string (optional, max 200 chars)",
  "notes": "string (optional, max 500 chars)",
  "booking_date": "datetime (auto-generated)",
  "status": "string (default: 'pending')"
}
```

### **Validation Rules**:
- `full_name`: Required, minimum 2 characters
- `email`: Required, valid email format
- `phone`: Required, valid UK phone number
- `service`: Must match paid service type
- `transaction_ref`: Must be unique and valid
- `payment_intent_id`: Must exist and be successful in Stripe

### **Response**:
```json
{
  "success": true,
  "message": "Booking confirmed! You will receive a confirmation email shortly.",
  "booking_id": "BK-20231107-XXXXX",
  "next_steps": "Daniel will contact you within 24 hours to schedule your session."
}
```

### **Actions Required**:
1. Verify payment with Stripe
2. Store booking in database
3. Send confirmation email to client with:
   - Booking reference
   - Service details
   - Next steps
   - Contact information
4. Send notification to admin with client details
5. Create calendar event/reminder
6. Update analytics/reporting

---

## 3. Database Schema

### **3.1 Contacts Table**
```sql
CREATE TABLE contacts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  reference_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  service VARCHAR(50) NOT NULL,
  message TEXT,
  status VARCHAR(20) DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);
```

### **3.2 Bookings Table**
```sql
CREATE TABLE bookings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  booking_id VARCHAR(50) UNIQUE NOT NULL,
  transaction_ref VARCHAR(100) UNIQUE NOT NULL,
  payment_intent_id VARCHAR(100) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  service VARCHAR(50) NOT NULL,
  amount INT NOT NULL,
  current_band VARCHAR(20),
  target_role VARCHAR(200),
  notes TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  payment_status VARCHAR(20) DEFAULT 'completed',
  session_scheduled_at TIMESTAMP NULL,
  session_completed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_booking_id (booking_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);
```

### **3.3 Payments Table**
```sql
CREATE TABLE payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  payment_intent_id VARCHAR(100) UNIQUE NOT NULL,
  booking_id VARCHAR(50),
  amount INT NOT NULL,
  currency VARCHAR(3) DEFAULT 'gbp',
  status VARCHAR(20) NOT NULL,
  stripe_response JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(booking_id),
  INDEX idx_payment_intent (payment_intent_id),
  INDEX idx_status (status)
);
```

---

## 4. Email Templates

### **4.1 Contact Form Confirmation Email**

**To**: Client  
**Subject**: "Your Free Consultation Request - NHS Career Boost"

**Content**:
```
Hi [Name],

Thank you for reaching out to NHS Career Boost!

I've received your consultation request for [Service Name]. I'll review your details and get back to you within 24 hours to discuss how I can help you achieve your NHS career goals.

Your Reference: [Reference ID]
Service Interest: [Service Name]

In the meantime, feel free to:
- Browse our services: https://nhscareerboost.co.uk/services.html
- Read client testimonials: https://nhscareerboost.co.uk/testimonials.html
- Connect on LinkedIn: [LinkedIn URL]

Looking forward to speaking with you soon!

Best regards,
Daniel Okojie
NHS Career Boost
Email: daniel@nhscareerboost.co.uk
WhatsApp: +44 7506 323070
```

---

### **4.2 Booking Confirmation Email**

**To**: Client  
**Subject**: "Booking Confirmed - [Service Name] - NHS Career Boost"

**Content**:
```
Hi [Full Name],

Great news! Your booking has been confirmed.

BOOKING DETAILS
---------------
Booking Reference: [Booking ID]
Transaction Reference: [Transaction Ref]
Service: [Service Name]
Amount Paid: £[Amount]
Date: [Booking Date]

WHAT'S INCLUDED
---------------
[List of features for the selected service]

NEXT STEPS
----------
1. I'll contact you within 24 hours via email or phone to schedule your session
2. Please check your spam folder if you don't hear from me
3. Save my contact details:
   - Email: daniel@nhscareerboost.co.uk
   - WhatsApp: +44 7506 323070

PREPARATION
-----------
[Service-specific preparation instructions]

For CV Review:
- Please send your current CV to daniel@nhscareerboost.co.uk
- Include the job description you're targeting (if available)

For Supporting Statement:
- Send your draft statement or the job description
- Note any specific concerns or areas you'd like to focus on

For Mock Interview:
- Send the job description and person specification
- Prepare your STAR examples in advance

For Complete Package:
- Send your CV and any draft materials
- We'll schedule multiple sessions over the coming weeks

If you have any questions, don't hesitate to reach out.

Looking forward to working with you!

Best regards,
Daniel Okojie
NHS Career Boost
```

---

### **4.3 Admin Notification Email**

**To**: daniel@nhscareerboost.co.uk  
**Subject**: "[NEW BOOKING] [Service Name] - [Client Name]"

**Content**:
```
NEW BOOKING RECEIVED

Client Details:
- Name: [Full Name]
- Email: [Email]
- Phone: [Phone]
- Current Band: [Current Band]
- Target Role: [Target Role]

Booking Details:
- Booking ID: [Booking ID]
- Service: [Service Name]
- Amount: £[Amount]
- Transaction Ref: [Transaction Ref]
- Payment Intent: [Payment Intent ID]
- Date: [Booking Date]

Additional Notes:
[Notes from client]

Action Required:
1. Contact client within 24 hours
2. Schedule session
3. Send preparation materials

View in admin panel: [Admin URL]
```

---

## 5. Stripe Integration

### **Required Stripe Configuration**:

1. **API Keys**:
   - Publishable Key (frontend)
   - Secret Key (backend)

2. **Webhook Endpoint**: `POST /api/webhooks/stripe`

3. **Events to Handle**:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`

4. **Webhook Handler**:
```javascript
// Pseudo-code
async function handleStripeWebhook(event) {
  switch (event.type) {
    case 'payment_intent.succeeded':
      // Update payment status in database
      // Send confirmation emails
      // Update booking status
      break;
    
    case 'payment_intent.payment_failed':
      // Log failure
      // Send notification to admin
      // Update payment status
      break;
    
    case 'charge.refunded':
      // Update booking status
      // Send refund confirmation email
      // Notify admin
      break;
  }
}
```

---

## 6. Security Requirements

### **6.1 Input Validation**:
- Sanitize all user inputs
- Validate email formats
- Validate phone numbers (UK format)
- Prevent SQL injection
- Prevent XSS attacks
- Rate limiting on form submissions

### **6.2 CORS Configuration**:
```javascript
{
  origin: 'https://nhscareerboost.co.uk',
  methods: ['GET', 'POST'],
  credentials: true
}
```

### **6.3 Environment Variables**:
```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=nhs_career_boost
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=daniel@nhscareerboost.co.uk
SMTP_PASSWORD=your_app_password
SMTP_FROM=daniel@nhscareerboost.co.uk

# Application
APP_URL=https://nhscareerboost.co.uk
API_URL=https://api.nhscareerboost.co.uk
NODE_ENV=production
```

---

## 7. API Error Responses

### **Standard Error Format**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "field": "email"
  }
}
```

### **Error Codes**:
- `VALIDATION_ERROR` - Invalid input data
- `PAYMENT_FAILED` - Payment processing failed
- `DUPLICATE_BOOKING` - Booking already exists
- `SERVER_ERROR` - Internal server error
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `UNAUTHORIZED` - Invalid authentication

---

## 8. Admin Dashboard Requirements

### **Features Needed**:

1. **Bookings Management**:
   - View all bookings
   - Filter by status, date, service
   - Update booking status
   - Schedule sessions
   - Mark as completed

2. **Contact Requests**:
   - View all contact form submissions
   - Mark as contacted/completed
   - Add notes

3. **Analytics**:
   - Total bookings by service
   - Revenue tracking
   - Conversion rates
   - Popular services

4. **Client Management**:
   - View client history
   - Export client data
   - Send follow-up emails

---

## 9. Recommended Tech Stack

### **Backend Framework Options**:
- **Node.js + Express** (Recommended for JavaScript consistency)
- **Python + Flask/Django**
- **PHP + Laravel**

### **Database**:
- **MySQL** or **PostgreSQL** (Recommended)
- **MongoDB** (Alternative for NoSQL approach)

### **Email Service**:
- **SendGrid** (Recommended)
- **AWS SES**
- **Mailgun**
- **Gmail SMTP** (for development)

### **Hosting**:
- **Backend**: AWS EC2, DigitalOcean, Heroku, or Vercel
- **Database**: AWS RDS, DigitalOcean Managed Database
- **Frontend**: Netlify, Vercel, or AWS S3 + CloudFront

---

## 10. Testing Requirements

### **Unit Tests**:
- Form validation functions
- Payment processing logic
- Email sending functions
- Database queries

### **Integration Tests**:
- Contact form submission flow
- Booking and payment flow
- Webhook handling
- Email delivery

### **Manual Testing Checklist**:
- [ ] Contact form submission
- [ ] Email confirmations received
- [ ] Payment processing (test mode)
- [ ] Booking completion
- [ ] Admin notifications
- [ ] Error handling
- [ ] Mobile responsiveness
- [ ] Cross-browser compatibility

---

## 11. Deployment Checklist

- [ ] Set up production database
- [ ] Configure Stripe live keys
- [ ] Set up email service
- [ ] Configure CORS for production domain
- [ ] Set up SSL certificates
- [ ] Configure environment variables
- [ ] Set up webhook endpoints
- [ ] Test payment flow end-to-end
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy
- [ ] Set up error alerting
- [ ] Document API endpoints
- [ ] Create admin user accounts

---

## 12. Maintenance & Monitoring

### **Logging**:
- Log all form submissions
- Log payment transactions
- Log errors and exceptions
- Log webhook events

### **Monitoring**:
- API uptime monitoring
- Payment success rate
- Email delivery rate
- Database performance
- Error rate tracking

### **Backup Strategy**:
- Daily database backups
- Weekly full backups
- Retain backups for 30 days
- Test restore procedures monthly

---

## Contact for Backend Development

For questions or clarifications about these requirements, contact:
- **Email**: daniel@nhscareerboost.co.uk
- **WhatsApp**: +44 7506 323070

---

**Document Version**: 1.0  
**Last Updated**: November 7, 2025  
**Frontend Repository**: /Users/henryjohntech/Documents/Builds/FrontendProjects/nhs
