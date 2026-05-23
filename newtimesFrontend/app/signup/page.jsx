"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { FaFacebookF } from "react-icons/fa";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import ImageToBase64 from "@/helpers/ImageToBase64.jsx";
import { toast } from "react-hot-toast";

const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080/api"

const SignUp = () => {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    profilePic: "",
  });

  const [photo, setPhoto] = useState("");

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) return;

    const base64 = await ImageToBase64(file);
    setPhoto(base64);
    setData((prev) => ({ ...prev, profilePic: base64 }));
  };

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      const res = await fetch(`${backendUrl}/user/signup`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          profilePic: data.profilePic,
        }),
      });

      const responseData = await res.json();

      if (res.ok) {
        toast.success(responseData.message || "Signup successful");
        router.push("/login"); // ✅ Next.js navigation
      } else {
        toast.error(responseData.message || "Signup failed!");
        console.error("Signup failed:", responseData.message);
      }
    } catch (error) {
      toast.error("Something went wrong!");
      console.error(error);
    }
  };

  return (
    <section className="flex justify-center items-start min-h-screen pt-16 bg-gradient-to-r from-blue-100 to-blue-50">
      <div className="w-full max-w-md p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg">

          {/* Profile Photo */}
          <div className="flex flex-col items-center mb-8">
            <label className="relative w-32 h-32 cursor-pointer rounded-full border overflow-hidden">
              {photo && (
                <img src={photo} alt="user" className="w-full h-full object-cover" />
              )}
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </label>
          </div>

          <h2 className="text-2xl font-bold text-center mb-6">
            Create Your Account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="name"
              value={data.name}
              onChange={handleOnChange}
              placeholder="Full Name"
              className="w-full px-4 py-2 border rounded-lg"
            />

            <input
              name="email"
              type="email"
              value={data.email}
              onChange={handleOnChange}
              placeholder="Email"
              className="w-full px-4 py-2 border rounded-lg"
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={data.password}
                onChange={handleOnChange}
                placeholder="Password"
                className="w-full px-4 py-2 border rounded-lg pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2"
              >
                {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </button>
            </div>

            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={data.confirmPassword}
                onChange={handleOnChange}
                placeholder="Confirm Password"
                className="w-full px-4 py-2 border rounded-lg pr-12"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-2"
              >
                {showConfirmPassword ? (
                  <AiOutlineEyeInvisible />
                ) : (
                  <AiOutlineEye />
                )}
              </button>
            </div>

            <button className="w-full py-2 bg-blue-600 text-white rounded-full">
              Sign Up
            </button>
          </form>

          <p className="text-center mt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600">
              Login
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default SignUp;
