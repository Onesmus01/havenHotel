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

const app = express()
app.set("trust proxy", 1); 
app.use(cookieParser())


// ── CORS: Must be FIRST, before any routes ──
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:3000',
    'https://haven-hotelk.vercel.app'
].filter(Boolean); // Remove undefined/null

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, Postman)
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

// ── Debug middleware: Log every request ──
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    console.log("  Origin:", req.headers.origin);
    console.log("  Cookies:", req.cookies);
    next();
});

// ── Routes ──
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