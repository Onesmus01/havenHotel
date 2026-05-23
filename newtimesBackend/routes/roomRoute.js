import express from "express";
import multer from "multer";
import {
  createRoom,
  getAllRooms,
  getRoomById,
  updateRoomStatus,
  deleteRoom,
  validateRoom,
  updateRoom,
  getAllHeroImages
} from "../controller/roomController.js";
import authToken from "../middleware/authToken.js";

const roomRouter = express.Router();

// ✅ Memory storage so files go to Cloudinary directly
const storage = multer.memoryStorage();
const upload = multer({ storage });

roomRouter.post("/add-room",authToken,
  upload.array("images", 4),
  validateRoom,
  createRoom
);

roomRouter.get("/get-rooms", getAllRooms);
roomRouter.get("/hero/all", authToken, getAllHeroImages);
roomRouter.get("/:roomId",  getRoomById);
roomRouter.put("/update-room/:roomId", authToken,upload.array("images", 4),
  validateRoom, updateRoom);
roomRouter.patch("/:roomId/status", authToken, updateRoomStatus);
roomRouter.delete("/:roomId", authToken, deleteRoom);

//admin hero image
import {
  createHeroImage,
  updateHeroImage,
  deleteHeroImage,
  getActiveHeroImage,
} from "../controller/roomController.js"


// public
roomRouter.get("/hero/active", getActiveHeroImage)

// protected
roomRouter.post("/hero/add-hero",authToken,upload.single("image"),createHeroImage)

roomRouter.put("/hero/:id",authToken,upload.single("image"),updateHeroImage)

roomRouter.delete("/hero/:id",authToken,deleteHeroImage)



export default roomRouter;
