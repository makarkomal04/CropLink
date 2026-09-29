=== EMAIL CONFIGURATION REQUIRED ===

To enable email notifications, add the following variables to your .env file:

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password

For Gmail:
1. Enable 2-Factor Authentication on your Google Account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the App Password in EMAIL_PASS (not your regular password)

Alternative Email Services:
- SendGrid: More reliable for production
- Mailgun: Good for transactional emails  
- AWS SES: Cost-effective for high volume

For Testing Only (No real emails sent):
- Leave EMAIL_USER and EMAIL_PASS empty
- Emails will be logged to console instead

Email Notifications Implemented:
✅ Order confirmation to customer
✅ Order notification to farmers  
✅ Product approval to farmer
✅ Farmer account verification

The application will work without email configuration, 
but users won't receive email notifications.
