// utils/isAdmin.js
import User from "../models/userModel.js";

const isAdmin = async (userId) => {
  if (!userId) return false;

  try {
    const user = await User.findById(userId);
    if (!user) return false;

    return user.role === "ADMIN";
  } catch (err) {
    console.error("Error checking admin:", err);
    return false;
  }
};

export default isAdmin;

