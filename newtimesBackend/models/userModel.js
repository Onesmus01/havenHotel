import mongoose from 'mongoose';

// User Schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true, 
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true, 
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    profilePic: {
      type: String,
      default: "", 
    },
    role: {
      type: String,
      enum: ["GENERAL", "ADMIN", "STAFF"], 
      default: "GENERAL",
    },
    loyaltyTier: {
      type: String,
      enum: ["Bronze", "Silver", "Gold", "Platinum"], 
      default: "Bronze",
    },
    totalBookings: {
      type: Number,
      default: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
    lastBooking: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, 
  }
);

// Prevent model overwrite on hot reload
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
