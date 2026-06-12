import express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
dotenv.config()
import cors from 'cors'
import connectDB from './config/db.js'
import userRouter from './routes/userRoute.js'
import roomRouter from './routes/roomRoute.js'
import bookingRouter from './routes/bookingRoute.js'
import paymentRoutes from "./routes/paymentRoute.js";
import cron from "node-cron";
import { autoExpireBookings } from "./controller/bookingController.js";  // ← check path
import { syncRoomStatuses } from "./controller/roomController.js";        // ← check path

// ─── CRON JOBS ───

// Auto-expire bookings every hour
cron.schedule("0 * * * *", async () => {
  console.log("[CRON] Running auto-expire job...", new Date().toISOString());
  try {
    await autoExpireBookings();
  } catch (err) {
    console.error("[CRON] Auto-expire failed:", err);
  }
});

// Sync room statuses every 6 hours (safety net)
cron.schedule("0 */6 * * *", async () => {
  console.log("[CRON] Running room status sync...", new Date().toISOString());
  try {
    await syncRoomStatuses();
  } catch (err) {
    console.error("[CRON] Sync failed:", err);
  }
});

// Run once on startup
(async () => {
  console.log("[STARTUP] Running initial checks...");
  try {
    await autoExpireBookings();
    await syncRoomStatuses();
  } catch (err) {
    console.error("[STARTUP] Initial check failed:", err);
  }
})();

const app = express()
app.set("trust proxy", 1); 
app.use(cookieParser())

// ── CORS ──
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:3000',
    'https://haven-hotelk.vercel.app'
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        console.log("❌ CORS blocked origin:", origin);
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Debug middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    console.log("  Origin:", req.headers.origin);
    console.log("  Cookies:", req.cookies);
    next();
});

// Routes
app.use('/api/user', userRouter)
app.use('/api/room', roomRouter)
app.use('/api/bookings', bookingRouter)
app.use("/api/payments", paymentRoutes);

const PORT = process.env.PORT || 8080

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
    console.log("Allowed origins:", allowedOrigins);
    connectDB()
})