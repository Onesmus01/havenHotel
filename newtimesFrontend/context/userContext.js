"use client";

import { createContext, useEffect, useState } from "react";
import { toast } from "react-hot-toast";

// Create context
export const Context = createContext(null);

const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080/api";

// Named export for provider
export const ContextProvider = ({ children }) => {
  const [user, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true); // ✅ track loading

  const fetchUserDetails = async () => {
    setLoading(true);
    try {
        const token = localStorage.getItem("token");  // ✅ Get token from storage
        
        const res = await fetch(`${backendUrl}/user/user-details`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,  // ✅ Send in header
            },
        });
        
        const data = await res.json();
        if (res.ok) setUserDetails(data.data);
        else {
            toast.error(data.message || "Failed to fetch user details");
            if (res.status === 401) {
                localStorage.removeItem("token");  // Clear invalid token
                setUserDetails(null);
            }
        }
    } catch (err) {
        toast.error(err.message || "Something went wrong");
    } finally {
        setLoading(false);
    }
};
  useEffect(() => {
    fetchUserDetails();
  }, []);

  return (
    <Context.Provider
      value={{ user, loading, setUserDetails, fetchUserDetails, toast, backendUrl }}
    >
      {children}
    </Context.Provider>
  );
};
