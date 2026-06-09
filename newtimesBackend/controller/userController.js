import User from '../models/userModel.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import Booking from "../models/bookingModel.js";
import Room from "../models/roomModel.js";

export const signIn = async (req, res) => {
    try {
        const { email, password } = req.body;

        // ── Validation ─────────────────────────────────────────────
        if (!email) {
            return res.status(400).json({ 
                success: false, 
                message: "Please provide email" 
            });
        }

        if (!password) {
            return res.status(400).json({ 
                success: false, 
                message: "Please provide password" 
            });
        }

        // ── Find user ──────────────────────────────────────────────
        const user = await User.findOne({ email }).select('+password');
        
        if (!user) {
            // Use same message as invalid password to prevent user enumeration
            return res.status(401).json({ 
                success: false, 
                message: "Invalid credentials" 
            });
        }

        // ── Verify password ────────────────────────────────────────
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            return res.status(401).json({ 
                success: false, 
                message: "Invalid credentials" 
            });
        }

        // ── Check if account is active (optional but recommended) ──
        if (user.isActive === false) {
            return res.status(403).json({
                success: false,
                message: "Account is deactivated. Please contact support."
            });
        }

        // ── Generate JWT ───────────────────────────────────────────
        const tokenPayload = {
            userId: user._id,
            email: user.email,
            // Add role if you have RBAC: role: user.role
        };

        const token = jwt.sign(
            tokenPayload,
            process.env.JWT_SECRET,
            { expiresIn: '2d', issuer: 'your-app-name' }
        );

        // ── Set cookie ─────────────────────────────────────────────
        const isProduction = process.env.NODE_ENV === 'production';
        
        const cookieOptions = {
            httpOnly: true,
            secure: isProduction,           // true in prod, false in dev
            sameSite: isProduction ? 'none' : 'lax', // 'none' needs secure=true
            maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days in ms
            path: '/',
            // domain: isProduction ? '.yourdomain.com' : undefined
        };

        res.cookie('token', token, cookieOptions);

        // ── Send response ──────────────────────────────────────────
        return res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                // Add other safe fields, NEVER send password
            }
        });

    } catch (error) {
        console.error('SignIn Error:', error);
        
        return res.status(500).json({
            success: false,
            message: isProduction 
                ? "Internal server error" 
                : error.message
        });
    }
};

export const signUp = async (req,res) => {
    try {
        const {name,email,password} = req.body
           if (!name) return res.status(400).json({ success: false, message: "Please provide username" });
            if (!email) return res.status(400).json({ success: false, message: "Please provide email" });
            if (!password) return res.status(400).json({ success: false, message: "Please provide password" });
        const userData = await User.findOne({email})
        if(userData){
            return res.status(400).json({success: false,message: "User has already registered"})
        }
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt)
        if(!hashedPassword){
            throw new Error("Something is wrong")
        }

        const savedUser = new User({
            name: name,
            role: 'GENERAL',
            email: email,
            password: hashedPassword
        })

        await savedUser.save()
        res.status(201).json({success: true,message: "User created successfully",data: savedUser})
    } catch (error) {
        res.status(500).json({success: false, message: error.message})
        console.log(error.message);
    }
}

export const logout = async (req, res) => {
  try {
    // Clear the cookie named "token"
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // optional
      sameSite: "strict",
    });

    res.json({ success: true, message: "Logged out successfully", data: [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
 
 export const userDetails = async (req,res)=> {
    try {

        const user = await User.findById(req.userId).select("-password")

        res.status(200).json({
            success: true,
            message: 'User details available',
            data: user
            
        })
    } catch (error) {
        res.status(500).json({success: false,message: "Internal server Error"})
    }

 }

 export const updateUser = async(req,res)=> {
    try {
        const {userId,name,email,role} = req.body
        const payload = {
            ...(email && {email: email}),
            ...(name && {name: name}),
            ...(role && {role: role})
        }

        const updatedUser = await User.findByIdAndUpdate(userId,payload,{new:true}).select("-password")
            if (!updatedUser) {
            return res.status(404).json({
            success: false,
            message: "User not found",
        });
        }
          return res.status(200).json({
          success: true,
          message: "User updated successfully",
          data: updatedUser
    });
    

    } catch (error) {
         return res.status(500).json({
         success: false,
         message: "Server error"
    });
  }
    
}
export const getAllUsers = async(req,res)=> {
    try {
        const users =await User.find().select("-password")
        await res.status(200).json({
            success:true,
            message:"user fetched Successfully",
            data: users
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });

    }
}

export const getAdminStats = async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const totalRevenueData = await Booking.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
    ]);
    const totalRevenue = totalRevenueData[0]?.totalRevenue || 0;

    // Occupancy rate = booked rooms / total rooms
    const totalRooms = await Room.countDocuments();
    const bookedRooms = await Booking.distinct("roomId").then(arr => arr.length);
    const occupancyRate = totalRooms ? Math.round((bookedRooms / totalRooms) * 100) : 0;

    // Room type performance
    const roomTypePerformance = await Booking.aggregate([
      { $group: { _id: "$roomType", count: { $sum: 1 } } },
    ]);

    // Average guest rating (if you store ratings in Booking)
    const avgRatingData = await Booking.aggregate([
      { $match: { rating: { $exists: true } } },
      { $group: { _id: null, averageRating: { $avg: "$rating" } } },
    ]);
    const averageRating = avgRatingData[0]?.averageRating || 0;

    res.status(200).json({
      success: true,
      data: {
        totalBookings,
        totalRevenue,
        occupancyRate,
        roomTypePerformance,
        averageRating: averageRating.toFixed(1),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch analytics" });
  }
};
