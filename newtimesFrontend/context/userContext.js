"use client";

import { createContext, useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export const Context = createContext(null);

const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080/api";

export const ContextProvider = ({ children }) => {
  const [user, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setUserDetails(null);
        setLoading(false);
        return;
      }

      const res = await fetch(`${backendUrl}/user/user-details`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        setUserDetails(data.data);
      } else {
        localStorage.removeItem("token");
        setUserDetails(null);
        toast.error(data.message || "Session expired");
      }
    } catch (err) {
      toast.error(err.message || "Something went wrong");
      setUserDetails(null);
    } finally {
      setLoading(false);
    }
  };

  // ✅ LOGOUT FUNCTION
  const logoutUser = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${backendUrl}/user/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      // Ignore backend errors
    } finally {
      localStorage.removeItem("token");
      setUserDetails(null);
      toast.success("Logged out successfully");
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  return (
    <Context.Provider
      value={{
        user,
        loading,
        setUserDetails,
        fetchUserDetails,
        logoutUser, // ✅ Added here
        toast,
        backendUrl,
      }}
    >
      {children}
    </Context.Provider>
  );
};