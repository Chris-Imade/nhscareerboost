# Backend API Updates Required for Appointment Scheduling

## Overview
The consultation booking form now includes date and time selection fields. The backend API needs to be updated to accept and store these new fields.

## API Endpoint
**Endpoint:** `POST https://nhscareerboost-server.onrender.com/api/contact`

## New Fields Added to Request Body

The following fields have been added to the API request:

```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "service": "string",
  "appointmentDate": "string (YYYY-MM-DD format)",  // NEW FIELD
  "appointmentTime": "string (HH:MM format)",       // NEW FIELD
  "message": "string (includes all details)"
}
```

## Backend Changes Required

### 1. Update Request Schema/Validation
Add validation for the new fields:
- `appointmentDate`: Required, string, format: YYYY-MM-DD
- `appointmentTime`: Required, string, format: HH:MM (24-hour)

### 2. Database Schema Update
If storing in a database, add these columns:
```sql
ALTER TABLE bookings ADD COLUMN appointment_date DATE;
ALTER TABLE bookings ADD COLUMN appointment_time TIME;
```

Or for MongoDB:
```javascript
{
  // ... existing fields
  appointmentDate: {
    type: String,
    required: true
  },
  appointmentTime: {
    type: String,
    required: true
  }
}
```

### 3. Email Notification Update
Update the email template to include appointment details:

**Subject:** New Consultation Booking - [Service Name]

**Body should include:**
- Customer Name
- Email
- Phone
- Service Selected
- **Appointment Date** (NEW)
- **Appointment Time** (NEW)
- NHS Band
- Role Applying For
- Additional Notes
- Payment ID

### 4. Example Backend Implementation (Node.js/Express)

```javascript
// Example route handler update
app.post('/api/contact', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      service,
      appointmentDate,  // NEW
      appointmentTime,  // NEW
      message
    } = req.body;

    // Validation
    if (!appointmentDate || !appointmentTime) {
      return res.status(400).json({
        success: false,
        message: 'Appointment date and time are required'
      });
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(appointmentDate)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD'
      });
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(appointmentTime)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid time format. Use HH:MM (24-hour)'
      });
    }

    // Store in database
    const booking = await Booking.create({
      name,
      email,
      phone,
      service,
      appointmentDate,
      appointmentTime,
      message,
      createdAt: new Date()
    });

    // Send email notification
    await sendBookingEmail({
      to: 'daniel@nhscareerboost.co.uk',
      subject: `New Consultation Booking - ${service}`,
      html: `
        <h2>New Consultation Booking</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Service:</strong> ${service}</p>
        <p><strong>Appointment Date:</strong> ${appointmentDate}</p>
        <p><strong>Appointment Time:</strong> ${appointmentTime}</p>
        <hr>
        <p>${message}</p>
      `
    });

    // Send confirmation email to customer
    await sendBookingEmail({
      to: email,
      subject: 'Booking Confirmation - NHS Career Boost',
      html: `
        <h2>Booking Confirmed!</h2>
        <p>Dear ${name},</p>
        <p>Your consultation has been successfully booked.</p>
        <p><strong>Service:</strong> ${service}</p>
        <p><strong>Date:</strong> ${appointmentDate}</p>
        <p><strong>Time:</strong> ${appointmentTime} (UK Time)</p>
        <p>We'll send you the meeting details 24 hours before your appointment.</p>
        <p>Best regards,<br>NHS Career Boost Team</p>
      `
    });

    res.json({
      success: true,
      message: 'Booking confirmed',
      bookingId: booking.id
    });

  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process booking'
    });
  }
});
```

## Testing the Changes

### Test Request Example
```bash
curl -X POST https://nhscareerboost-server.onrender.com/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Smith",
    "email": "john@example.com",
    "phone": "07123456789",
    "service": "CV Review & Optimisation",
    "appointmentDate": "2025-11-20",
    "appointmentTime": "14:30",
    "message": "Payment ID: pi_123abc\nNHS Band: Band 5\nRole: Senior Nurse"
  }'
```

### Expected Response
```json
{
  "success": true,
  "message": "Booking confirmed",
  "bookingId": "booking_123"
}
```

## Additional Recommendations

1. **Calendar Sync**: Consider implementing automatic calendar invites sent via email
2. **Reminder System**: Set up automated email/SMS reminders 24 hours before appointments
3. **Timezone Handling**: Ensure all times are stored and displayed in UK timezone (GMT/BST)
4. **Availability Check**: Implement a system to prevent double-booking time slots
5. **Admin Dashboard**: Create an interface to view and manage all scheduled appointments

## Frontend Changes Summary

### Files Modified:
1. **consultation.html**
   - Added date picker input field
   - Added time picker input field
   - Added Google Calendar and Apple Calendar buttons

2. **consultation.js**
   - Added date/time validation (minimum date = today)
   - Updated form submission to include appointment date/time
   - Implemented Google Calendar integration
   - Implemented Apple Calendar integration (.ics file download)
   - Added calendar buttons display after successful booking

### User Flow:
1. User selects service and completes payment
2. User fills in details form including preferred date/time
3. Form submits to backend with appointment details
4. On success, calendar buttons appear
5. User can add appointment to Google or Apple Calendar
6. User is redirected to confirmation page after 5 seconds

## Support
For questions or issues, contact the development team.
