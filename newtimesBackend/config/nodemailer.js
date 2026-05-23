// config/nodemailer.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Validate env vars
if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.error('[SMTP CONFIG ERROR] Missing SMTP_USER or SMTP_PASS in environment variables');
}

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false, // true for 465, false for other ports (587 uses STARTTLS)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false, // Helps with some certificate issues
  },
  debug: true, // Enable debug logging
  logger: true, // Log to console
});

// Verify SMTP connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('[SMTP VERIFY ERROR]', error.message);
    console.error('[SMTP VERIFY ERROR CODE]', error.code);
    console.error('[SMTP VERIFY ERROR RESPONSE]', error.response);
  } else {
    console.log('[SMTP VERIFIED] ✅ Server ready to send emails');
    console.log('[SMTP CONFIG] Host: smtp-relay.brevo.com, Port: 587');
  }
});

export default transporter;