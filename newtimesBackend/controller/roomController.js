import Room from "../models/roomModel.js";
import { body, validationResult } from "express-validator";
import cloudinary from "../config/cloudinary.js";

/**
 * Validation middleware for creating a room
 * Works correctly with multipart/form-data (FormData)
 */
// export const validateRoom = [
//   body("roomNumber")
//     .trim()
//     .notEmpty()
//     .withMessage("Room number is required"),

//   body("type")
//     .trim()
//     .notEmpty()
//     .withMessage("Room type is required"),

//   body("price")
//     .notEmpty()
//     .withMessage("Price is required")
//     .isNumeric()
//     .withMessage("Price must be a number"),

//   body("originalPrice")
//     .optional()
//     .isNumeric()
//     .withMessage("Original price must be a number"),

//   body("size")
//     .trim()
//     .notEmpty()
//     .withMessage("Room size is required"),

//   body("capacity")
//     .notEmpty()
//     .withMessage("Capacity is required")
//     .isInt({ min: 1 })
//     .withMessage("Capacity must be at least 1"),

//   body("view")
//     .trim()
//     .notEmpty()
//     .withMessage("View is required"),

//   body("floor")
//     .notEmpty()
//     .withMessage("Floor is required")
//     .isInt({ min: 1 })
//     .withMessage("Floor must be a number"),

//   body("rating")
//     .optional()
//     .isFloat({ min: 0, max: 5 })
//     .withMessage("Rating must be between 0 and 5"),

//   body("features")
//     .optional()
//     .isString()
//     .withMessage("Features must be a comma-separated string"),

//   body("amenities")
//     .optional()
//     .isString()
//     .withMessage("Amenities must be a comma-separated string"),
// ];

export const validateRoom = [
  body("roomNumber").trim().notEmpty().withMessage("Room number is required"),
  body("type").trim().notEmpty().withMessage("Room type is required"),
  body("price").notEmpty().withMessage("Price is required").isNumeric().withMessage("Price must be a number"),
  body("originalPrice").optional().isNumeric().withMessage("Original price must be a number"),
  body("size").trim().notEmpty().withMessage("Room size is required"),
  body("capacity").notEmpty().withMessage("Capacity is required").isInt({ min: 1 }).withMessage("Capacity must be at least 1"),
  body("view").trim().notEmpty().withMessage("View is required"),
  body("floor").notEmpty().withMessage("Floor is required").isInt({ min: 1 }).withMessage("Floor must be a number"),
  body("rating").optional().isFloat({ min: 0, max: 5 }).withMessage("Rating must be between 0 and 5"),
  body("features").optional().isArray().withMessage("Features must be an array"),
  body("amenities").optional().isArray().withMessage("Amenities must be an array"),
];

export const createRoom = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const {
      roomNumber,
      type,
      description,
      price,
      originalPrice,
      size,
      capacity,
      view,
      floor,
      rating,
      features = [],
      amenities = [],
      status,
    } = req.body;

    // ✅ Upload images from files (supports multiple)
    let uploadedImages = [];
    if (req.files?.length) {
      for (const file of req.files) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "hotel_rooms" },
            (error, result) => (error ? reject(error) : resolve(result))
          );
          stream.end(file.buffer);
        });
        uploadedImages.push(result.secure_url);
      }
    }

    // ✅ Handle features/amenities — could be string or array from FormData
    const parsedFeatures = Array.isArray(features) ? features : [features].filter(Boolean);
    const parsedAmenities = Array.isArray(amenities) ? amenities : [amenities].filter(Boolean);

    // ✅ roomNumber: keep as string (accepts "G1", "101", "A-12", etc.)
    // ✅ floor: accept string too ("Ground", "1st", "2nd") — remove Number() coercion
    const room = new Room({
      roomNumber: String(roomNumber).trim(),        // ← accepts "G1", 101, "A-12"
      type: type?.trim(),
      price: Number(price) || 0,
      originalPrice: originalPrice ? Number(originalPrice) : null,
      size: size?.trim(),
      capacity: Number(capacity) || 0,
      view: view?.trim(),
      floor: String(floor).trim(),                 // ← accepts "Ground", "1st", 2, etc.
      rating: rating ? Number(rating) : 0,
      reviews: Math.floor(Math.random() * 200) + 50,
      status: status || "available",
      features: parsedFeatures,
      amenities: parsedAmenities,
      description: description?.trim(),
      images: uploadedImages,
    });

    await room.save();

    res.status(201).json({
      success: true,
      message: "Room created successfully",
      data: room,
    });
  } catch (err) {
    console.error("Error creating room:", err);
    res.status(500).json({ success: false, message: "Server error while creating room" });
  }
};
export const updateRoom = async (req, res) => {
  try {
    const { roomId } = req.params;  // ← was 'id', now matches route :roomId

    const {
      roomNumber,
      type,
      description,
      price,
      originalPrice,
      size,
      capacity,
      view,
      floor,
      rating,
      features,
      amenities,
      status,
      imagesToDelete,
    } = req.body;

    // Find existing room
    const room = await Room.findById(roomId);  // ← use roomId here
    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    // Delete old images from Cloudinary if requested
    if (imagesToDelete?.length > 0) {
      for (const imgUrl of imagesToDelete) {
        try {
          const publicId = imgUrl.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(`hotel_rooms/${publicId}`);
        } catch (delErr) {
          console.warn("Failed to delete image:", delErr.message);
        }
      }
      room.images = room.images.filter((img) => !imagesToDelete.includes(img));
    }

    // Upload new images if any
    let newImages = [];
    if (req.files?.length) {
      for (const file of req.files) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "hotel_rooms" },
            (error, result) => (error ? reject(error) : resolve(result))
          );
          stream.end(file.buffer);
        });
        newImages.push(result.secure_url);
      }
    }

    // Parse features/amenities
    const parseField = (field) => {
      if (!field) return undefined;
      if (Array.isArray(field)) return field;
      return [field].filter(Boolean);
    };

    // Update fields (only if provided)
    const updates = {
      ...(roomNumber !== undefined && { roomNumber: String(roomNumber).trim() }),
      ...(type !== undefined && { type: type.trim() }),
      ...(price !== undefined && { price: Number(price) || 0 }),
      ...(originalPrice !== undefined && { originalPrice: originalPrice ? Number(originalPrice) : null }),
      ...(size !== undefined && { size: size.trim() }),
      ...(capacity !== undefined && { capacity: Number(capacity) || 0 }),
      ...(view !== undefined && { view: view.trim() }),
      ...(floor !== undefined && { floor: String(floor).trim() }),
      ...(rating !== undefined && { rating: Number(rating) || 0 }),
      ...(status !== undefined && { status }),
      ...(description !== undefined && { description: description.trim() }),
      ...(features !== undefined && { features: parseField(features) }),
      ...(amenities !== undefined && { amenities: parseField(amenities) }),
    };

    Object.assign(room, updates);
    
    if (newImages.length > 0) {
      room.images = [...room.images, ...newImages];
    }

    await room.save();

    res.status(200).json({
      success: true,
      message: "Room updated successfully",
      data: room,
    });
  } catch (err) {
    console.error("Error updating room:", err);
    res.status(500).json({ success: false, message: "Server error while updating room" });
  }
};;

export const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find().sort({ floor: 1, roomNumber: 1 }); // sorted by floor, then room number
    res.status(200).json({ success: true, count: rooms.length, data: rooms });
  } catch (err) {
    console.error("Error fetching rooms:", err);
    res.status(500).json({ success: false, message: "Failed to fetch rooms" });
  }
};
export const updateRoomStatus = async (req, res) => {
  try {
    const { roomId } = req.params; // room ID from URL
    const { status } = req.body;   // new status from request body

    // Validate status
    const allowedStatuses = ["available", "booked", "maintenance"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${allowedStatuses.join(", ")}`,
      });
    }

    // Find room and update
    const room = await Room.findByIdAndUpdate(
      roomId,
      { status },
      { new: true } // return the updated document
    );

    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    res.status(200).json({
      success: true,
      message: `Room status updated to '${status}'`,
      data: room,
    });
  } catch (err) {
    console.error("Error updating room status:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
import mongoose from "mongoose";

export const getRoomById = async (req, res) => {
  try {
    const { roomId } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return res.status(400).json({ success: false, message: "Invalid room ID" });
    }

    // Find room by MongoDB ID
    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    res.status(200).json({ success: true, data: room });
  } catch (err) {
    console.error("Error fetching room by ID:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    // Find and delete room
    const room = await Room.findByIdAndDelete(roomId);

    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    res.status(200).json({ success: true, message: "Room deleted successfully" });
  } catch (err) {
    console.error("Error deleting room:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

import HeroImage from "../models/HeroImage.js"; // adjust path

export const createHeroImage = async (req, res) => {
  try {
    console.log("Uploaded by user:", req.userId);

    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    // Deactivate any currently active hero images
    await HeroImage.updateMany({}, { isActive: false });

    // Upload buffer to Cloudinary
    const streamUpload = (buffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "hero-images" },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        stream.end(buffer);
      });
    };

    const uploadResult = await streamUpload(req.file.buffer);

    const hero = await HeroImage.create({
      imageUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      isActive: true,
    });

    res.status(201).json({ success: true, data: hero });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export const updateHeroImage = async (req, res) => {
  try {
    const hero = await HeroImage.findById(req.params.id)
    if (!hero) {
      return res.status(404).json({ message: "Hero image not found" })
    }

    if (req.file) {
      // delete old image from cloudinary
      await cloudinary.uploader.destroy(hero.publicId)

      // upload new image
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "hero-images",
      })

      hero.imageUrl = uploadResult.secure_url
      hero.publicId = uploadResult.public_id
    }

    await hero.save()

    res.json({
      success: true,
      message: "Hero image updated",
      data: hero,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const deleteHeroImage = async (req, res) => {
  try {
    const hero = await HeroImage.findById(req.params.id)
    if (!hero) {
      return res.status(404).json({ message: "Hero image not found" })
    }

    await cloudinary.uploader.destroy(hero.publicId)
    await hero.deleteOne()

    res.json({ success: true, message: "Hero image deleted" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getActiveHeroImage = async (req, res) => {
  try {
    const hero = await HeroImage.findOne({ isActive: true })
    res.json(hero)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getAllHeroImages = async (req, res) => {
  try {
    const heroes = await HeroImage.find().sort({ createdAt: -1 }); // or Hero model
    res.status(200).json({ success: true, data: heroes });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const setActiveHeroImage = async (req, res) => {
  
}
// GET /room/:id
// export const getRoomById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Validate ID
//     if (!id.match(/^[0-9a-fA-F]{24}$/)) {
//       return res.status(400).json({ success: false, message: "Invalid room ID" });
//     }

//     const room = await Room.findById(id);

//     if (!room) {
//       return res.status(404).json({ success: false, message: "Room not found" });
//     }

//     res.status(200).json({ success: true, data: room });
//   } catch (err) {
//     console.error("Error fetching room by ID:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };

