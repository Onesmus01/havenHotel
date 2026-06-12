"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  Hotel,
  MapPin,
  Users,
  CreditCard,
  Trash2,
  Plus,
  AlertCircle,
  CheckCircle,
  X,
  ArrowRight,
  Timer,
  Loader2,
  RefreshCw,
} from "lucide-react";

// ─── API CONFIG ───
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080/api"

const getAuthHeaders = () => {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token") || sessionStorage.getItem("token")
      : "";
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

// ─── COUNTDOWN TIMER ───
const CountdownTimer = ({
  targetDate,
  onExpire,
  bookingId,
}: {
  targetDate: string;
  onExpire?: (id: string) => void;
  bookingId: string;
}) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isExpired, setIsExpired] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const calculateTimeLeft = useCallback(() => {
    const now = new Date().getTime();
    const target = new Date(targetDate).getTime();
    const diff = target - now;

    if (diff <= 0) {
      setIsExpired(true);
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      onExpire?.(bookingId);
      return null;
    }

    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      ),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
    };
  }, [targetDate, onExpire, bookingId]);

  useEffect(() => {
    const initial = calculateTimeLeft();
    if (initial) setTimeLeft(initial);

    intervalRef.current = setInterval(() => {
      const remaining = calculateTimeLeft();
      if (remaining) setTimeLeft(remaining);
      else if (intervalRef.current) clearInterval(intervalRef.current);
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [calculateTimeLeft]);

  if (isExpired) {
    return (
      <div className="flex items-center gap-2 text-red-500 font-semibold animate-pulse">
        <AlertCircle size={18} />
        <span>Booking Expired</span>
      </div>
    );
  }

  const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="bg-slate-800 text-white rounded-lg px-3 py-2 min-w-[48px] text-center">
        <span className="text-lg font-bold tabular-nums">
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="text-xs text-slate-500 mt-1">{label}</span>
    </div>
  );

  return (
    <div className="flex items-center gap-2">
      <Timer size={18} className="text-amber-500" />
      <div className="flex gap-1.5">
        <TimeUnit value={timeLeft.days} label="Days" />
        <TimeUnit value={timeLeft.hours} label="Hrs" />
        <TimeUnit value={timeLeft.minutes} label="Min" />
        <TimeUnit value={timeLeft.seconds} label="Sec" />
      </div>
    </div>
  );
};

// ─── EXTEND MODAL ───
const ExtendModal = ({
  booking,
  isOpen,
  onClose,
}: {
  booking: any;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const router = useRouter();
  const [additionalNights, setAdditionalNights] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("mpesa");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !booking) return null;

  const extensionCost = additionalNights * booking.pricePerNight;

  const handleProceedToPayment = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const res = await fetch(`${backendUrl}/bookings/${booking._id}/extend`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          additionalNights,
          method: paymentMethod,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      // Next.js doesn't support location.state in router.push
      // Store extension data in sessionStorage for PaymentPage to read
      const extensionPayload = {
        type: "extension",
        extensionPaymentId: data.data.extensionPaymentId,
        bookingId: booking._id,
        originalBooking: data.data.originalBooking,
        additionalNights,
        extensionCost,
        newCheckOut: data.data.newCheckOut,
        currentCheckOut: data.data.currentCheckOut,
        paymentMethod,
      };
      sessionStorage.setItem("extensionPaymentData", JSON.stringify(extensionPayload));

      onClose();
      router.push("/payment?mode=extension");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-800">Extend Stay</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="bg-slate-50 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <Hotel size={20} className="text-blue-600" />
            <div>
              <p className="font-semibold text-slate-800">{booking.roomType}</p>
              <p className="text-sm text-slate-500">Room #{booking.roomNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Calendar size={14} />
            <span>
              Current checkout: {new Date(booking.checkOut).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Additional Nights
          </label>
          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                setAdditionalNights(Math.max(1, additionalNights - 1))
              }
              className="w-10 h-10 rounded-lg border-2 border-slate-200 flex items-center justify-center hover:border-blue-500 hover:text-blue-600 transition-colors"
            >
              -
            </button>
            <span className="text-2xl font-bold text-slate-800 w-12 text-center">
              {additionalNights}
            </span>
            <button
              onClick={() =>
                setAdditionalNights(Math.min(30, additionalNights + 1))
              }
              className="w-10 h-10 rounded-lg border-2 border-slate-200 flex items-center justify-center hover:border-blue-500 hover:text-blue-600 transition-colors"
            >
              +
            </button>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Payment Method
          </label>
          <div className="grid grid-cols-2 gap-2">
            {["mpesa", "card", "bank", "cash"].map((method) => (
              <button
                key={method}
                onClick={() => setPaymentMethod(method)}
                className={`px-3 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                  paymentMethod === method
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                {method === "mpesa"
                  ? "M-Pesa"
                  : method.charAt(0).toUpperCase() + method.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Extension Cost</span>
            <span className="text-xl font-bold text-slate-800">
              KES {extensionCost.toLocaleString()}
            </span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            KES {booking.pricePerNight.toLocaleString()}/night ×{" "}
            {additionalNights} nights
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleProceedToPayment}
            disabled={isProcessing}
            className="flex-1 px-4 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <CreditCard size={18} />
            )}
            Proceed to Pay
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── BOOKING CARD ───
const BookingCard = ({
  booking,
  onExpire,
  onExtendClick,
  onDelete,
}: {
  booking: any;
  onExpire: (id: string) => void;
  onExtendClick: (b: any) => void;
  onDelete: (id: string) => void;
}) => {
  const status = booking.computedStatus || "upcoming";
  const isActive = status === "active";
  const isUpcoming = status === "upcoming";
  const isExpired = status === "expired";

  const statusColors: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-700 border-emerald-200",
    upcoming: "bg-blue-100 text-blue-700 border-blue-200",
    expired: "bg-slate-100 text-slate-500 border-slate-200",
  };

  const statusLabels: Record<string, string> = {
    active: "Active",
    upcoming: "Upcoming",
    expired: "Completed",
  };

  const roomImage =
    booking.roomId?.images?.[0] ||
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=250&fit=crop";

  return (
    <div
      className={`bg-white rounded-2xl border-2 overflow-hidden transition-all duration-300 hover:shadow-lg ${
        isExpired ? "border-slate-200 opacity-75" : "border-slate-100"
      }`}
    >
      <div className="relative h-48 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={roomImage}
          alt={booking.roomType}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[status]}`}
          >
            {statusLabels[status]}
          </span>
        </div>
        {isExpired && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
              <CheckCircle size={16} className="text-slate-500" />
              <span className="text-sm font-medium text-slate-600">
                Stay Completed
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              {booking.roomType}
            </h3>
            <div className="flex items-center gap-1 text-sm text-slate-500 mt-1">
              <MapPin size={14} />
              <span>Room #{booking.roomNumber}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-slate-800">
              KES {booking.totalAmount?.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500">total</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
          <div className="flex items-center gap-1">
            <Users size={14} />
            <span>
              {booking.guests} guest{booking.guests > 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Hotel size={14} />
            <span>{booking.bedType} bed</span>
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar size={14} className="text-slate-400" />
              <span className="text-slate-600">
                {new Date(booking.checkIn).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            <ArrowRight size={14} className="text-slate-400" />
            <div className="flex items-center gap-2 text-sm">
              <Calendar size={14} className="text-slate-400" />
              <span className="text-slate-600">
                {new Date(booking.checkOut).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
          <div className="text-xs text-slate-500 text-center">
            {booking.nights} night{booking.nights > 1 ? "s" : ""} stay
          </div>
        </div>

        {isActive && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-100 rounded-xl">
            <p className="text-xs font-medium text-amber-700 mb-2">
              Time Remaining
            </p>
            <CountdownTimer
              targetDate={booking.checkOut}
              onExpire={onExpire}
              bookingId={booking._id}
            />
          </div>
        )}

        {isUpcoming && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-xl">
            <p className="text-xs font-medium text-blue-700 mb-2">Starts In</p>
            <CountdownTimer
              targetDate={booking.checkIn}
              onExpire={() => {}}
              bookingId={booking._id}
            />
          </div>
        )}

        <div className="flex gap-2">
          {isActive && (
            <button
              onClick={() => onExtendClick(booking)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} />
              Extend Stay
            </button>
          )}
          {isExpired && (
            <button
              onClick={() => onDelete(booking._id)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors"
            >
              <Trash2 size={16} />
              Remove
            </button>
          )}
          {isUpcoming && (
            <button
              onClick={() => onExtendClick(booking)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              <Calendar size={16} />
              Modify Dates
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── MAIN PAGE ───
export default function MyBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [extendModalBooking, setExtendModalBooking] = useState<any>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "info" | "error";
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${backendUrl}/bookings/my-bookings`, {
        headers: getAuthHeaders(),
      });

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      setBookings(data.data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Auto-refresh every 30 seconds to catch status changes (bookings expiring)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchBookings();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchBookings]);

  // Check if returning from successful payment extension
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("extensionSuccess") === "true") {
      showToast("Booking extended successfully!", "success");
      fetchBookings();
      // Clean up URL
      router.replace("/my-bookings", { scroll: false });
    }
  }, [router]);

  const showToast = (
    message: string,
    type: "success" | "info" | "error" = "success"
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleExpire = useCallback((bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) =>
        b._id === bookingId ? { ...b, computedStatus: "expired" } : b
      )
    );
    showToast("Booking has expired", "info");
  }, []);

  const handleDelete = async (bookingId: string) => {
    try {
      const res = await fetch(`${backendUrl}/bookings/${bookingId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      setBookings((prev) => prev.filter((b) => b._id !== bookingId));
      showToast("Booking removed from history");
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const status = b.computedStatus || "upcoming";
    if (activeTab === "all") return true;
    if (activeTab === "active")
      return status === "active" || status === "upcoming";
    if (activeTab === "expired") return status === "expired";
    return true;
  });

  const activeCount = bookings.filter((b) => {
    const s = b.computedStatus || "upcoming";
    return s === "active" || s === "upcoming";
  }).length;
  const expiredCount = bookings.filter(
    (b) => (b.computedStatus || "upcoming") === "expired"
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={40} className="animate-spin text-blue-600" />
          <p className="text-slate-500">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">My Bookings</h1>
              <p className="text-slate-500 mt-1">
                Manage your hotel reservations
              </p>
            </div>
            <button
              onClick={fetchBookings}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 text-sm font-medium hover:text-slate-900 hover:border-slate-300 transition-colors"
              title="Refresh bookings"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
            <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
              {[
                { key: "all", label: "All", count: bookings.length },
                { key: "active", label: "Active", count: activeCount },
                { key: "expired", label: "History", count: expiredCount },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.key
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-center">
            {error}
          </div>
        )}

        {filteredBookings.length === 0 ? (
          <div className="text-center py-20">
            <Hotel size={64} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 mb-2">
              No bookings found
            </h3>
            <p className="text-slate-400">
              You don&apos;t have any {activeTab !== "all" ? activeTab : ""}{" "}
              bookings yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBookings.map((booking) => (
              <BookingCard
                key={booking._id}
                booking={booking}
                onExpire={handleExpire}
                onExtendClick={setExtendModalBooking}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Extend Modal */}
      <ExtendModal
        booking={extendModalBooking}
        isOpen={!!extendModalBooking}
        onClose={() => setExtendModalBooking(null)}
      />

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 z-50 animate-in slide-in-from-bottom-2 ${
            toast.type === "success"
              ? "bg-emerald-600 text-white"
              : toast.type === "info"
              ? "bg-blue-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle size={18} />
          ) : (
            <AlertCircle size={18} />
          )}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}
    </div>
  );
}