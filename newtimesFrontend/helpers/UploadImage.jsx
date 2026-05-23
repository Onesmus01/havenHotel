import React from 'react';

const cloudinaryUploadUrl = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_NAME}/image/upload`;

const UploadImage = async (image) => {
  try {
    const formData = new FormData();
    formData.append("file", image);
    formData.append("upload_preset", "digitalCommerce");

    const response = await fetch(cloudinaryUploadUrl, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Cloudinary upload failed");
    }

    // Return uploaded image URL
    return data.secure_url;
  } catch (error) {
    console.error("Upload error:", error);
    return null;
  }
};

export default UploadImage;
