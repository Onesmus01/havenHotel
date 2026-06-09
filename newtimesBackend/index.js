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
app.use(cors({
    origin: [process.env.FRONTEND_URL,'http://localhost:3000','https://haven-hotelk.vercel.app'],
    credentials: true,
}))
app.use(express.json())
app.use(cookieParser())

app.use('/api/user',userRouter)
app.use('/api/room',roomRouter)
app.use('/api/bookings',bookingRouter)
app.use("/api/payments", paymentRoutes);

app.use(express.urlencoded({ extended: true }))
const PORT = process.env.PORT || 8080

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
  connectDB()
})
