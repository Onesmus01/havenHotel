import Payment from "../models/paymentModel.js";
import Booking from "../models/bookingModel.js";
import User from "../models/userModel.js";
import Room from "../models/roomModel.js";
import axios from "axios";
import { Buffer } from "buffer";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import { createCanvas } from "canvas";
import transporter from "../config/nodemailer.js";
import validator from "validator";
import dotenv from "dotenv";
dotenv.config();

// ==================== CONFIG ====================
const {
  MPESA_CONSUMER_KEY,
  MPESA_CONSUMER_SECRET,
  MPESA_SHORTCODE,
  MPESA_PASSKEY,
  CALLBACK_URL,
  MPESA_ENV,
  SENDER_EMAIL,
  OWNER_EMAIL,
} = process.env;

// 🔥 FIX: Always use sandbox for testing until you go live
// Daraja sandbox credentials ONLY work with sandbox URL
const IS_PRODUCTION = MPESA_ENV === "production";
const BASE_URL = IS_PRODUCTION
  ? "https://api.safaricom.co.ke"
  : "https://sandbox.safaricom.co.ke";

console.log("[MPESA CONFIG] Environment:", MPESA_ENV || "NOT SET (defaulting to sandbox)");
console.log("[MPESA CONFIG] Base URL:", BASE_URL);
console.log("[MPESA CONFIG] Shortcode:", MPESA_SHORTCODE ? "SET" : "MISSING");
console.log("[MPESA CONFIG] Consumer Key:", MPESA_CONSUMER_KEY ? `SET (${MPESA_CONSUMER_KEY.slice(0, 8)}...)` : "MISSING");
console.log("[MPESA CONFIG] Consumer Secret:", MPESA_CONSUMER_SECRET ? `SET (${MPESA_CONSUMER_SECRET.slice(0, 8)}...)` : "MISSING");
console.log("[MPESA CONFIG] Passkey:", MPESA_PASSKEY ? "SET" : "MISSING");
console.log("[MPESA CONFIG] Callback URL:", CALLBACK_URL || "MISSING");

// ==================== HELPERS ====================
const sanitize = (input) => validator.escape(String(input).trim());

let cachedToken = null;
let tokenExpiry = null;

/**
 * 🔥 BULLETPROOF M-Pesa Token Generator
 * Handles both sandbox and production environments
 */
const getMpesaToken = async () => {
  const now = Date.now();

  // Return cached token if still valid
  if (cachedToken && tokenExpiry && now < tokenExpiry) {
    console.log("[MPESA] Using cached token");
    return cachedToken;
  }

  // Validate credentials exist
  if (!MPESA_CONSUMER_KEY || !MPESA_CONSUMER_SECRET) {
    throw new Error("MPESA_CONSUMER_KEY and MPESA_CONSUMER_SECRET must be set in .env");
  }

  const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString("base64");
  const url = `${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`;

  console.log("[MPESA] Requesting token from:", url);
  console.log("[MPESA] Auth header (first 40 chars):", `Basic ${auth.slice(0, 40)}...`);

  try {
    const { data } = await axios.get(url, {
      headers: {
        Authorization: `Basic ${auth}`,
      },
      timeout: 15000,
    });

    if (!data.access_token) {
      throw new Error("M-Pesa returned empty access_token");
    }

    cachedToken = data.access_token;
    // Refresh 5 minutes before expiry
    tokenExpiry = now + ((data.expires_in || 3599) - 300) * 1000;

    console.log("[MPESA] Token received successfully, expires in:", data.expires_in, "seconds");
    return cachedToken;

  } catch (err) {
    console.error("[MPESA TOKEN ERROR DETAILS]:");
    console.error("  URL:", url);
    console.error("  Status:", err.response?.status);
    console.error("  Status Text:", err.response?.statusText);
    console.error("  Response Data:", JSON.stringify(err.response?.data, null, 2));
    console.error("  Error Code:", err.code);
    console.error("  Error Message:", err.message);

    // Provide specific error messages
    if (err.response?.status === 400) {
      throw new Error(
        `Invalid M-Pesa credentials (400). Ensure:
        1. You're using the correct environment (${IS_PRODUCTION ? "production" : "sandbox"})
        2. Consumer Key and Secret match your ${IS_PRODUCTION ? "live" : "sandbox"} app on Daraja portal
        3. Your app is approved for the Lipa na M-Pesa Online API product`
      );
    }
    if (err.response?.status === 401) {
      throw new Error("M-Pesa authentication failed (401). Consumer Key/Secret are invalid.");
    }
    if (err.code === "ECONNREFUSED" || err.code === "ENOTFOUND") {
      throw new Error(`Cannot connect to M-Pesa API at ${BASE_URL}. Check your internet connection.`);
    }

    throw new Error(`M-Pesa token request failed: ${err.message}`);
  }
};

const generateTxId = () => `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;

// ==================== EMAIL RECEIPT ====================
const sendBookingReceipt = async (emails, name, amount, transactionId, bookingId, roomDetails, status = "success") => {
  try {
    if (!transporter || !SENDER_EMAIL) {
      console.log("[EMAIL SKIP] No email transporter configured");
      return false;
    }

    const qrCanvas = createCanvas(300, 300);
    await QRCode.toCanvas(qrCanvas, `https://newtimeshotel.co/verify/${transactionId}`, {
      width: 280, margin: 1, color: { dark: "#C0A062", light: "#0A0A0A" },
    });
    const qrDataUrl = qrCanvas.toDataURL();

    const pdfBuffer = await new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: "A4", margin: 0 });
      const buffers = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", reject);

      const palette = { bg: "#0A0A0A", card: "#141414", gold: "#C0A062", silver: "#A0A0A0", white: "#FFFFFF" };

      doc.rect(0, 0, 595, 842).fill(palette.bg);
      doc.rect(0, 0, 595, 3).fill(palette.gold);

      doc.fillColor(palette.gold).fontSize(36).font("Helvetica-Bold").text("✦", 50, 40);
      doc.fillColor(palette.white).fontSize(24).text("NEWTIMES", 85, 45);
      doc.fillColor(palette.gold).text("HOTEL", 200, 45);
      doc.fillColor(palette.silver).fontSize(10).text("LUXURY HAVEN • NAIROBI", 50, 75);

      const statusColor = status === "success" ? "#22C55E" : status === "pending" ? "#F59E0B" : "#EF4444";
      const pillW = 100;
      doc.roundedRect(595 - pillW - 50, 50, pillW, 32, 16).fill(statusColor + "20").stroke(statusColor);
      doc.fillColor(statusColor).fontSize(11).font("Helvetica-Bold").text(status.toUpperCase(), 595 - pillW - 50, 60, { width: pillW, align: "center" });

      let y = 130;
      doc.fillColor(palette.silver).fontSize(10).font("Helvetica-Bold").text("OFFICIAL BOOKING RECEIPT", 50, y);
      doc.moveTo(50, y + 15).lineTo(200, y + 15).stroke(palette.gold).lineWidth(2);

      y += 40;
      doc.fillColor(palette.white).fontSize(48).font("Helvetica-Bold").text(`KES ${Number(amount).toLocaleString()}`, 50, y);
      doc.fillColor(palette.gold).fontSize(14).text("Total Amount Paid", 50, y + 55);

      const metaX = 350;
      doc.fillColor(palette.silver).fontSize(9).text("RECEIPT NUMBER", metaX, y);
      doc.fillColor(palette.white).fontSize(12).font("Helvetica-Bold").text(`#${transactionId.slice(-10).toUpperCase()}`, metaX, y + 15);
      doc.fillColor(palette.silver).fontSize(9).text("BOOKING REF", metaX, y + 40);
      doc.fillColor(palette.white).fontSize(11).font("Helvetica-Bold").text(`BKG-${bookingId.toString().slice(-8).toUpperCase()}`, metaX, y + 55);

      y = 280;
      doc.roundedRect(50, y, 495, 90, 8).fill(palette.card).stroke("#262626");
      doc.fillColor(palette.gold).fontSize(9).font("Helvetica-Bold").text("GUEST", 70, y + 20);
      doc.fillColor(palette.white).fontSize(18).font("Helvetica-Bold").text(name.toUpperCase(), 70, y + 40);
      doc.fillColor(palette.silver).fontSize(10).text("Verified Guest • Nairobi, Kenya", 70, y + 65);

      y = 390;
      doc.roundedRect(50, y, 495, 120, 8).fill(palette.card).stroke("#262626");
      doc.fillColor(palette.gold).fontSize(9).font("Helvetica-Bold").text("BOOKING DETAILS", 70, y + 20);
      if (roomDetails) {
        doc.fillColor(palette.white).fontSize(14).text(`${roomDetails.type} — Room ${roomDetails.roomNumber}`, 70, y + 45);
        doc.fillColor(palette.silver).fontSize(11).text(`${roomDetails.view} • ${roomDetails.size || ""}`, 70, y + 65);
        doc.fillColor(palette.silver).fontSize(11).text(`Check-in: ${roomDetails.checkIn} | Check-out: ${roomDetails.checkOut}`, 70, y + 85);
      }

      y = 530;
      doc.roundedRect(50, y, 240, 100, 8).fill(palette.card).stroke("#262626");
      doc.fillColor(palette.gold).fontSize(9).font("Helvetica-Bold").text("PAYMENT METHOD", 70, y + 20);
      doc.fillColor(palette.white).fontSize(14).font("Helvetica-Bold").text("M-Pesa", 70, y + 45);
      doc.fillColor(palette.silver).fontSize(10).text("Mobile Money", 70, y + 65);
      doc.fillColor(palette.gold).fontSize(9).text("✓ INSTANT CONFIRMATION", 70, y + 85);

      const totalsX = 320;
      doc.fillColor(palette.silver).fontSize(10).text("Subtotal", totalsX, y + 20);
      doc.fillColor(palette.white).fontSize(11).text(`KES ${Number(amount).toLocaleString()}`, 545, y + 20, { align: "right" });
      doc.fillColor(palette.silver).fontSize(10).text("Service Fee", totalsX, y + 45);
      doc.fillColor(palette.white).fontSize(11).text("Included", 545, y + 45, { align: "right" });
      doc.fillColor(palette.silver).fontSize(10).text("Tax (16%)", totalsX, y + 70);
      doc.fillColor(palette.white).fontSize(11).text("Included", 545, y + 70, { align: "right" });

      y += 100;
      doc.roundedRect(totalsX, y, 225, 50, 6).fill(palette.gold + "15").stroke(palette.gold);
      doc.fillColor(palette.gold).fontSize(10).font("Helvetica-Bold").text("TOTAL PAID", totalsX + 15, y + 15);
      doc.fillColor(palette.white).fontSize(22).font("Helvetica-Bold").text(`KES ${Number(amount).toLocaleString()}`, 545, y + 12, { align: "right" });

      y = 720;
      doc.roundedRect(50, y, 100, 100, 8).stroke(palette.gold).lineWidth(2);
      doc.fillColor(palette.gold).fontSize(8).text("[QR CODE]", 100, y + 45, { align: "center" });
      doc.fillColor(palette.white).fontSize(14).font("Helvetica-Bold").text("Verify Authenticity", 170, y + 20);
      doc.fillColor(palette.silver).fontSize(10).text("Scan to verify on our secure ledger", 170, y + 45);
      doc.fillColor(palette.gold).fontSize(9).font("Helvetica-Bold").text(`newtimeshotel.co/verify/${transactionId.slice(-8)}`, 170, y + 65);

      doc.rect(0, 839, 595, 3).fill(palette.gold);
      doc.end();
    });

    const htmlContent = `<!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Newtimes Hotel — Booking Confirmed</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Space Grotesk', sans-serif; background: #050505; color: #fff; line-height: 1.6; }
          .wrapper { max-width: 680px; margin: 0 auto; background: linear-gradient(180deg, #0A0A0A 0%, #141414 100%); border: 1px solid #1A1A1A; }
          .header { padding: 40px 30px; border-bottom: 1px solid #1A1A1A; position: relative; }
          .header::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, transparent, #C0A062, transparent); }
          .brand { display: flex; align-items: center; gap: 12px; }
          .brand-icon { width: 48px; height: 48px; background: linear-gradient(135deg, #C0A062, #8B7355); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; box-shadow: 0 0 30px rgba(192,160,98,0.3); }
          .brand-text { font-size: 28px; font-weight: 700; letter-spacing: 2px; }
          .brand-text span { color: #C0A062; }
          .status-pill { position: absolute; right: 30px; top: 50%; transform: translateY(-50%); background: ${status === "success" ? "#22C55E15" : "#F59E0B15"}; border: 1px solid ${status === "success" ? "#22C55E" : "#F59E0B"}; color: ${status === "success" ? "#22C55E" : "#F59E0B"}; padding: 10px 24px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; }
          .hero { padding: 50px 30px; text-align: center; background: radial-gradient(ellipse at center, #1A1A1A 0%, transparent 70%); }
          .amount-label { color: #C0A062; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 4px; margin-bottom: 16px; }
          .amount-value { font-size: 56px; font-weight: 700; background: linear-gradient(135deg, #FFFFFF 0%, #C0A062 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 8px; }
          .customer-card { margin: 0 30px 30px; padding: 24px; background: #141414; border: 1px solid #262626; border-radius: 16px; }
          .card-label { color: #C0A062; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; }
          .customer-name { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
          .customer-meta { color: #A0A0A0; font-size: 13px; }
          .details { margin: 0 30px 30px; padding: 24px; background: #141414; border: 1px solid #262626; border-radius: 16px; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #1A1A1A; color: #A0A0A0; font-size: 14px; }
          .detail-row:last-child { border-bottom: none; }
          .detail-row .value { color: #fff; font-weight: 600; }
          .total-row { display: flex; justify-content: space-between; padding: 20px 0 0; margin-top: 10px; border-top: 2px solid #C0A062; color: #fff; font-size: 18px; font-weight: 700; }
          .total-row .amount { color: #C0A062; font-size: 24px; }
          .footer { padding: 40px 30px; background: #050505; border-top: 1px solid #1A1A1A; text-align: center; }
          .footer-brand { font-size: 20px; font-weight: 700; margin-bottom: 8px; }
          .footer-brand span { color: #C0A062; }
          .footer-text { color: #666; font-size: 13px; margin-bottom: 4px; }
          .copyright { color: #444; font-size: 12px; margin-top: 24px; }
          @media (max-width: 480px) { .amount-value { font-size: 40px; } }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="header">
            <div class="brand">
              <div class="brand-icon">✦</div>
              <div class="brand-text">NEWTIMES<span>HOTEL</span></div>
            </div>
            <div class="status-pill">${status}</div>
          </div>
          <div class="hero">
            <div class="amount-label">Total Amount Paid</div>
            <div class="amount-value">KES ${Number(amount).toLocaleString()}</div>
            <div style="color: #A0A0A0; font-size: 14px;">Kenyan Shilling • Booking Confirmed</div>
          </div>
          <div class="customer-card">
            <div class="card-label">Guest</div>
            <div class="customer-name">${name}</div>
            <div class="customer-meta">Receipt #${transactionId.slice(-8).toUpperCase()}</div>
          </div>
          <div class="details">
            <div class="card-label" style="margin-bottom: 16px;">Booking Details</div>
            <div class="detail-row"><span>Room Type</span><span class="value">${roomDetails?.type || "Standard Room"}</span></div>
            <div class="detail-row"><span>Room Number</span><span class="value">${roomDetails?.roomNumber || "TBA"}</span></div>
            <div class="detail-row"><span>Check-In</span><span class="value">${roomDetails?.checkIn || "—"}</span></div>
            <div class="detail-row"><span>Check-Out</span><span class="value">${roomDetails?.checkOut || "—"}</span></div>
            <div class="detail-row"><span>Nights</span><span class="value">${roomDetails?.nights || 1}</span></div>
            <div class="detail-row"><span>Guests</span><span class="value">${roomDetails?.guests || 1}</span></div>
            <div class="total-row"><span>TOTAL PAID</span><span class="amount">KES ${Number(amount).toLocaleString()}</span></div>
          </div>
          <div class="footer">
            <div class="footer-brand">NEWTIMES<span>HOTEL</span></div>
            <div class="footer-text">reservations@newtimeshotel.co • +254 759 755 575</div>
            <div class="footer-text">Nairobi, Kenya</div>
            <div class="copyright">© 2026 Newtimes Luxury Haven. All rights reserved.</div>
          </div>
        </div>
      </body>
      </html>`;

    await transporter.sendMail({
      from: `"Newtimes Hotel ✦" <${SENDER_EMAIL}>`,
      to: Array.isArray(emails) ? emails.join(",") : emails,
      subject: `✦ KES ${Number(amount).toLocaleString()} • BOOKING CONFIRMED | Newtimes Hotel #${transactionId.slice(-6).toUpperCase()}`,
      html: htmlContent,
      attachments: [{
        filename: `Newtimes-Booking-${transactionId.slice(-6).toUpperCase()}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      }],
    });

    console.log("[EMAIL SENT] Booking receipt delivered to:", emails);
    return true;
  } catch (err) {
    console.error("[EMAIL ERROR - NON BLOCKING]", err.message);
    return false;
  }
};

// ==================== DEBUG ROUTE ====================
export const debugMpesaConfig = async (req, res) => {
  try {
    // Try to get a token to verify credentials
    let tokenTest = { success: false, error: null };
    try {
      const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString("base64");
      const { data } = await axios.get(
        `${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
        { headers: { Authorization: `Basic ${auth}` }, timeout: 10000 }
      );
      tokenTest = { success: true, tokenPreview: data.access_token?.slice(0, 20) + "..." };
    } catch (err) {
      tokenTest = {
        success: false,
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      };
    }

    res.json({
      env: {
        MPESA_ENV: MPESA_ENV || "NOT SET",
        BASE_URL,
        IS_PRODUCTION,
        SHORTCODE_SET: !!MPESA_SHORTCODE,
        SHORTCODE_VALUE: MPESA_SHORTCODE ? `${MPESA_SHORTCODE.slice(0, 4)}...` : null,
        KEY_SET: !!MPESA_CONSUMER_KEY,
        KEY_PREVIEW: MPESA_CONSUMER_KEY ? `${MPESA_CONSUMER_KEY.slice(0, 10)}...` : null,
        SECRET_SET: !!MPESA_CONSUMER_SECRET,
        SECRET_PREVIEW: MPESA_CONSUMER_SECRET ? `${MPESA_CONSUMER_SECRET.slice(0, 10)}...` : null,
        PASSKEY_SET: !!MPESA_PASSKEY,
        CALLBACK_SET: !!CALLBACK_URL,
        CALLBACK_URL: CALLBACK_URL || null,
      },
      tokenTest,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==================== CONTROLLERS ====================

/**
 * @desc   Initiate M-Pesa STK Push
 * @route  POST /api/payments/mpesa/pay
 */
export const initiateMpesaPayment = async (req, res) => {
  try {
    let { phone, amount, bookingId, description } = req.body;
    phone = sanitize(phone);
    amount = Number(amount);

    // Validate env vars
    if (!MPESA_CONSUMER_KEY || !MPESA_CONSUMER_SECRET || !MPESA_SHORTCODE || !MPESA_PASSKEY) {
      console.error("[MPESA CONFIG ERROR] Missing environment variables");
      return res.status(500).json({
        success: false,
        message: "M-Pesa not configured. Contact admin.",
        debug: process.env.NODE_ENV === "development" ? {
          missing: [
            !MPESA_CONSUMER_KEY && "MPESA_CONSUMER_KEY",
            !MPESA_CONSUMER_SECRET && "MPESA_CONSUMER_SECRET",
            !MPESA_SHORTCODE && "MPESA_SHORTCODE",
            !MPESA_PASSKEY && "MPESA_PASSKEY",
          ].filter(Boolean),
        } : undefined,
      });
    }

    if (!phone || !bookingId || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid phone, amount, or booking ID" });
    }

    // Normalize phone
    let cleanPhone = phone.replace(/\s/g, "");
    if (cleanPhone.startsWith("0")) cleanPhone = "254" + cleanPhone.slice(1);
    if (cleanPhone.startsWith("+")) cleanPhone = cleanPhone.slice(1);

    if (!/^(2547|2541|2540)\d{8}$/.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Kenyan phone number. Use format: 07XX XXX XXX or 2547XX XXX XXX",
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    const user = await User.findById(req.userId || booking.user);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Prevent duplicate pending payments
    const existing = await Payment.findOne({
      booking: bookingId,
      status: { $in: ["pending", "processing"] },
    });
    if (existing) {
      return res.status(429).json({
        success: false,
        message: "Payment already in progress. Complete or cancel it first.",
      });
    }

    // Get M-Pesa token
    let token;
    try {
      token = await getMpesaToken();
    } catch (tokenErr) {
      console.error("[MPESA TOKEN ERROR]", tokenErr.message);
      return res.status(500).json({
        success: false,
        message: tokenErr.message,
        ...(process.env.NODE_ENV === "development" && { debug: tokenErr.stack }),
      });
    }

    const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, "").slice(0, 14);
    const password = Buffer.from(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`).toString("base64");

    console.log("[MPESA STK REQUEST]", {
      url: `${BASE_URL}/mpesa/stkpush/v1/processrequest`,
      shortcode: MPESA_SHORTCODE,
      phone: cleanPhone,
      amount: Math.ceil(amount),
      timestamp,
      callback: CALLBACK_URL || "NOT SET",
    });

    let mpesaResponse;
    try {
      const { data } = await axios.post(
        `${BASE_URL}/mpesa/stkpush/v1/processrequest`,
        {
          BusinessShortCode: MPESA_SHORTCODE,
          Password: password,
          Timestamp: timestamp,
          TransactionType: "CustomerPayBillOnline",
          Amount: Math.ceil(amount),
          PartyA: cleanPhone,
          PartyB: MPESA_SHORTCODE,
          PhoneNumber: cleanPhone,
          CallBackURL: CALLBACK_URL || "https://example.com/callback",
          AccountReference: `Booking-${bookingId.toString().slice(-6)}`,
          TransactionDesc: description || "Hotel Room Booking",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );
      mpesaResponse = data;
    } catch (apiErr) {
      console.error("[MPESA API ERROR]", {
        status: apiErr.response?.status,
        statusText: apiErr.response?.statusText,
        data: apiErr.response?.data,
        message: apiErr.message,
      });

      const safError = apiErr.response?.data;
      let userMessage = "M-Pesa request failed. Please try again.";

      if (safError?.errorCode === "400.002.02") userMessage = "Invalid phone number format";
      else if (safError?.errorCode === "500.003.02") userMessage = "M-Pesa system busy. Try again shortly.";
      else if (safError?.errorMessage?.includes("Invalid Access Token")) userMessage = "Authentication failed. Contact admin.";
      else if (apiErr.response?.status === 400) userMessage = "Invalid request. Check your credentials and try again.";
      else if (apiErr.response?.status === 401) userMessage = "M-Pesa authentication failed. Invalid credentials.";

      return res.status(500).json({
        success: false,
        message: userMessage,
        ...(process.env.NODE_ENV === "development" && {
          debug: {
            safError,
            status: apiErr.response?.status,
            url: `${BASE_URL}/mpesa/stkpush/v1/processrequest`,
          },
        }),
      });
    }

    const checkoutRequestId = mpesaResponse.CheckoutRequestID;

    if (!checkoutRequestId) {
      console.error("[MPESA NO CHECKOUT ID]", mpesaResponse);
      return res.status(500).json({
        success: false,
        message: "M-Pesa did not return a transaction ID",
        debug: process.env.NODE_ENV === "development" ? mpesaResponse : undefined,
      });
    }

    // Save payment record
    await Payment.create({
      user: user._id,
      booking: booking._id,
      customerName: `${booking.firstName || user.name} ${booking.lastName || ""}`.trim(),
      customerEmail: booking.email || user.email,
      customerPhone: cleanPhone,
      amount,
      currency: "KES",
      method: "mpesa",
      status: "pending",
      transactionId: generateTxId(),
      mpesaCheckoutRequestId: checkoutRequestId,
      phoneNumber: cleanPhone,
      gatewayResponse: mpesaResponse,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    return res.status(200).json({
      success: true,
      message: "STK Push sent to your phone. Enter M-Pesa PIN to complete.",
      transaction_id: checkoutRequestId,
    });

  } catch (error) {
    console.error("[MPESA STK UNEXPECTED ERROR]", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
      ...(process.env.NODE_ENV === "development" && { debug: error.message }),
    });
  }
};

/**
 * @desc   M-Pesa webhook callback
 * @route  POST /api/payments/mpesa/webhook
 */
export const mpesaWebhook = async (req, res) => {
  console.log("========== MPESA WEBHOOK HIT ==========");
  console.log("[WEBHOOK BODY]", JSON.stringify(req.body, null, 2));

  try {
    const stkCallback = req.body?.Body?.stkCallback;
    if (!stkCallback) {
      console.log("[WEBHOOK] Invalid payload - no stkCallback");
      return res.status(400).json({ message: "Invalid payload" });
    }

    const { CheckoutRequestID, ResultCode, ResultDesc } = stkCallback;
    console.log("[WEBHOOK] TX:", CheckoutRequestID, "| Code:", ResultCode, "| Desc:", ResultDesc);

    let status = "failed";
    if (ResultCode === 0) status = "success";
    else if (ResultCode === 1032) status = "cancelled";

    const payment = await Payment.findOne({ mpesaCheckoutRequestId: CheckoutRequestID });
    if (!payment) {
      console.log("[WEBHOOK] Payment not found for checkout ID:", CheckoutRequestID);
      return res.status(200).json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    if (["success", "cancelled", "failed"].includes(payment.status)) {
      console.log("[WEBHOOK] Already processed:", payment.status);
      return res.status(200).json({ message: "Already processed" });
    }

    payment.status = status;
    if (status === "success") {
      const meta = stkCallback.CallbackMetadata?.Item || [];
      const receipt = meta.find((i) => i.Name === "MpesaReceiptNumber");
      const paidAmount = meta.find((i) => i.Name === "Amount");

      payment.mpesaReceiptNumber = receipt?.Value;
      if (paidAmount?.Value) payment.amount = paidAmount.Value;
      console.log("[WEBHOOK] Receipt:", receipt?.Value, "Amount:", paidAmount?.Value);
    } else {
      payment.failureReason = ResultDesc;
    }
    await payment.save();

    // Update booking
    const booking = await Booking.findById(payment.booking);
    if (booking) {
      booking.paymentStatus = status === "success" ? "paid" : status === "cancelled" ? "cancelled" : "failed";
      booking.status = status === "success" ? "confirmed" : "pending";
      await booking.save();
      console.log("[WEBHOOK] Booking updated:", booking._id, "->", booking.status);

      if (status === "success") {
        await Room.findByIdAndUpdate(booking.roomId, { status: "booked" });
        console.log("[WEBHOOK] Room locked:", booking.roomId);
      }
    }

    // Send receipt on success
    if (status === "success") {
      try {
        const user = await User.findById(payment.user);
        const room = await Room.findById(booking?.roomId);
        if (user && booking) {
          const receiptSent = await sendBookingReceipt(
            [user.email, OWNER_EMAIL].filter(Boolean),
            payment.customerName || user.name,
            payment.amount,
            payment.transactionId,
            booking._id,
            {
              type: room?.type || "Room",
              roomNumber: room?.roomNumber || "TBA",
              checkIn: booking.checkIn ? new Date(booking.checkIn).toDateString() : "—",
              checkOut: booking.checkOut ? new Date(booking.checkOut).toDateString() : "—",
              nights: booking.nights || 1,
              guests: booking.guests || 1,
            },
            "success"
          );
          if (receiptSent) {
            payment.receiptSent = true;
            await payment.save();
          }
        }
      } catch (emailErr) {
        console.error("[WEBHOOK EMAIL ERROR - NON BLOCKING]", emailErr.message);
      }
    }

    console.log("========== WEBHOOK COMPLETE ==========");
    return res.status(200).json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (error) {
    console.error("[WEBHOOK ERROR]", error);
    return res.status(200).json({ ResultCode: 0, ResultDesc: "Accepted" });
  }
};

/**
 * @desc   Cancel pending M-Pesa payment
 * @route  POST /api/payments/mpesa/cancel/:transactionId
 */
export const cancelMpesaPayment = async (req, res) => {
  try {
    const payment = await Payment.findOne({
      mpesaCheckoutRequestId: req.params.transactionId,
      status: "pending",
    });
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found or already processed" });
    }

    payment.status = "cancelled";
    await payment.save();

    await Booking.findByIdAndUpdate(payment.booking, { paymentStatus: "cancelled", status: "pending" });
    res.json({ success: true, message: "Payment cancelled" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error cancelling payment" });
  }
};

/**
 * @desc   Check payment status
 * @route  GET /api/payments/mpesa/status/:transactionId
 */
export const checkPaymentStatus = async (req, res) => {
  try {
    const payment = await Payment.findOne({ mpesaCheckoutRequestId: req.params.transactionId });
    if (!payment) return res.status(404).json({ success: false, message: "Transaction not found" });

    let message;
    switch (payment.status) {
      case "success": message = "✅ Payment successful"; break;
      case "failed": message = "❌ Payment failed"; break;
      case "cancelled": message = "⚠️ Payment cancelled"; break;
      default: message = "⏳ Payment pending...";
    }

    res.json({ success: true, status: payment.status, message });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error checking status" });
  }
};

/**
 * @desc   Cash on arrival confirmation
 * @route  POST /api/payments/cash/confirm
 */
export const confirmCashPayment = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    const user = await User.findById(req.userId || booking.user);

    const payment = await Payment.create({
      user: user?._id || booking.user,
      booking: booking._id,
      customerName: `${booking.firstName} ${booking.lastName}`,
      customerEmail: booking.email,
      amount: booking.totalAmount || 0,
      currency: "KES",
      method: "cash",
      status: "success",
      transactionId: `CASH-${Date.now()}`,
      cashReceivedBy: "System (Pay on Arrival)",
      ipAddress: req.ip,
    });

    booking.paymentStatus = "pay_on_arrival";
    booking.status = "confirmed";
    await booking.save();
    await Room.findByIdAndUpdate(booking.roomId, { status: "booked" });

    res.json({ success: true, message: "Booking confirmed. Pay on arrival.", data: payment });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error confirming cash booking" });
  }
};

/**
 * @desc   Get payment by ID
 * @route  GET /api/payments/:id
 */
export const getPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate("booking");
    if (!payment) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: payment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Get all payments for a booking
 * @route  GET /api/payments/booking/:bookingId
 */
export const getPaymentsByBooking = async (req, res) => {
  try {
    const payments = await Payment.find({ booking: req.params.bookingId }).sort({ createdAt: -1 });
    res.json({ success: true, count: payments.length, data: payments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Admin: manual status update
 * @route  PATCH /api/payments/:id/status
 */
export const updatePaymentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const payment = await Payment.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!payment) return res.status(404).json({ success: false, message: "Not found" });

    if (status === "success") {
      await Booking.findByIdAndUpdate(payment.booking, { paymentStatus: "paid", status: "confirmed" });
      const booking = await Booking.findById(payment.booking);
      if (booking) await Room.findByIdAndUpdate(booking.roomId, { status: "booked" });
    }
    res.json({ success: true, data: payment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Get total revenue (admin)
 * @route  GET /api/payments/total-revenue
 */
export const getTotalRevenue = async (req, res) => {
  try {
    const result = await Payment.aggregate([
      { $match: { status: "success" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    res.json({ success: true, totalRevenue: result[0]?.total || 0 });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Get all payments (admin)
 * @route  GET /api/payments/all-payments
 */
export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 }).lean();

    const populated = await Promise.all(
      payments.map(async (p) => {
        let enriched = { ...p };

        if (p.user) {
          try {
            const user = await User.findById(p.user).select("name email phone").lean();
            if (user) enriched.user = user;
          } catch (e) { /* ignore */ }
        }

        if (p.booking) {
          try {
            const booking = await Booking.findById(p.booking)
              .select("firstName lastName email roomType roomNumber totalAmount status checkIn checkOut")
              .lean();
            if (booking) enriched.booking = booking;
          } catch (e) { /* ignore */ }
        }

        if (!enriched.customerName && enriched.booking) {
          enriched.customerName = `${enriched.booking.firstName || ""} ${enriched.booking.lastName || ""}`.trim();
        }
        if (!enriched.customerEmail && enriched.booking) {
          enriched.customerEmail = enriched.booking.email;
        }

        return enriched;
      })
    );

    res.json({ success: true, count: populated.length, data: populated });
  } catch (err) {
    console.error("[GET ALL PAYMENTS ERROR]", err);
    res.status(500).json({ success: false, message: err.message });
  }
};