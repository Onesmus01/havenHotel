import mongoose from "mongoose";

const heroImageSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true } // automatically adds createdAt and updatedAt
);

const HeroImage = mongoose.model("HeroImage", heroImageSchema);

export default HeroImage;
