import mongoose from 'mongoose';

// User Schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true, // remove extra spaces
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true, // store emails consistently
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    profilePic: {
      type: String,
      default: "", // URL or base64
    },
    role: {
      type: String,
      enum: ["GENERAL", "ADMIN", "STAFF"], // optional but safer
      default: "GENERAL",
    },
    loyaltyTier: {
      type: String,
      enum: ["Bronze", "Silver", "Gold", "Platinum"], // add more tiers later
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
    timestamps: true, // createdAt & updatedAt auto
  }
);

// Prevent model overwrite on hot reload
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
