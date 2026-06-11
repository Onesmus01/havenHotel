"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  Loader2,
  Shield,
  Home,
  CalendarDays,
  ArrowRight,
  Clock,
  FileText,
  Download,
  Sparkles,
  Hotel,
  MapPin,
  Star,
  AlertCircle,
  RefreshCw,
  Smartphone,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080/api";

function formatKES(amount: number) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

type VerifyState = "verifying" | "success" | "failed" | "timeout";

export default function PaymentVerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const transactionId = searchParams.get("tx") || searchParams.get("txId") || "";
  const bookingId = searchParams.get("bookingId") || "";
  const amount = Number(searchParams.get("amount")) || 0;
  const method = searchParams.get("method") || "mpesa";
  const mode = searchParams.get("mode") || "booking"; // "booking" | "extension"

  const [status, setStatus] = useState<VerifyState>("verifying");
  const [booking, setBooking] = useState<any>(null);
  const [room, setRoom] = useState<any>(null);
  const [attempts, setAttempts] = useState(0);
  const [receiptUrl, setReceiptUrl] = useState("");
  const [isConfirmingExtension, setIsConfirmingExtension] = useState(false);

  // 🔥 FIX: useRef for flags that shouldn't trigger re-renders
  const hasConfirmedExtension = useRef(false);
  const isPolling = useRef(true);

  const getToken = () => localStorage.getItem("token");

  // ─── POLL PAYMENT STATUS ───
  useEffect(() => {
    if (!transactionId) {
      setStatus("failed");
      return;
    }

    let interval: NodeJS.Timeout;
    let timeout: NodeJS.Timeout;

    const checkStatus = async () => {
      if (!isPolling.current) return;

      try {
        const res = await fetch(
          `${backendUrl}/payments/mpesa/status/${transactionId}`,
          {
            credentials: "include",
            headers: { Authorization: `Bearer ${getToken()}` },
          }
        );
        const data = await res.json();

        if (data.status === "success") {
          isPolling.current = false;
          clearInterval(interval);
          clearTimeout(timeout);

          // ─── EXTENSION: confirm on backend before showing success ───
          if (mode === "extension" && !hasConfirmedExtension.current) {
            hasConfirmedExtension.current = true;
            setIsConfirmingExtension(true);

            try {
              const extRaw = sessionStorage.getItem("extensionPaymentData");
              if (!extRaw) throw new Error("Extension data missing");

              const extData = JSON.parse(extRaw);

              const confirmRes = await fetch(
                `${backendUrl}/bookings/${bookingId}/extend/confirm`,
                {
                  method: "POST",
                  credentials: "include",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getToken()}`,
                  },
                  body: JSON.stringify({
                    paymentId: extData.extensionPaymentId,
                    mpesaReceiptNumber: transactionId,
                  }),
                }
              );

              const confirmData = await confirmRes.json();
              if (!confirmData.success) throw new Error(confirmData.message);

              sessionStorage.removeItem("extensionPaymentData");
              setIsConfirmingExtension(false);
              setStatus("success");
              fetchBookingDetails();
            } catch (err: any) {
              setIsConfirmingExtension(false);
              setStatus("failed");
            }
          } else {
            // Regular booking — webhook already handled it
            setStatus("success");
            fetchBookingDetails();
          }
        } else if (["failed", "cancelled"].includes(data.status)) {
          isPolling.current = false;
          clearInterval(interval);
          clearTimeout(timeout);
          setStatus("failed");
        } else {
          setAttempts((prev) => prev + 1);
        }
      } catch {
        setAttempts((prev) => prev + 1);
      }
    };

    checkStatus();
    interval = setInterval(checkStatus, 3000);

    // 🔥 FIX: Use ref in timeout check instead of state
    timeout = setTimeout(() => {
      clearInterval(interval);
      if (isPolling.current) {
        isPolling.current = false;
        setStatus("timeout");
      }
    }, 90000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [transactionId, mode, bookingId]);

  // ─── FETCH BOOKING DETAILS ───
  const fetchBookingDetails = async () => {
    if (!bookingId) return;
    try {
      const [bookingRes, receiptRes] = await Promise.all([
        fetch(`${backendUrl}/bookings/${bookingId}`, {
          credentials: "include",
          headers: { Authorization: `Bearer ${getToken()}` },
        }),
        fetch(`${backendUrl}/payments/receipt/${bookingId}`, {
          credentials: "include",
          headers: { Authorization: `Bearer ${getToken()}` },
        }).catch(() => null),
      ]);

      const bookingData = await bookingRes.json();
      if (bookingData.success) {
        setBooking(bookingData.data);
        if (bookingData.data.roomId || bookingData.data.room) {
          const roomRes = await fetch(
            `${backendUrl}/room/${bookingData.data.roomId || bookingData.data.room}`,
            {
              credentials: "include",
              headers: { Authorization: `Bearer ${getToken()}` },
            }
          );
          const roomData = await roomRes.json();
          if (roomData.success) setRoom(roomData.data);
        }
      }

      if (receiptRes) {
        const receiptData = await receiptRes.json();
        if (receiptData.success) setReceiptUrl(receiptData.data?.url || "");
      }
    } catch (err) {
      console.error("Failed to fetch booking details", err);
    }
  };

  const handleRetry = () => {
    setStatus("verifying");
    setAttempts(0);
    isPolling.current = true;
    window.location.reload();
  };

  // ==================== VERIFYING / CONFIRMING STATES ====================
  if (status === "verifying" || isConfirmingExtension) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-0 shadow-2xl overflow-hidden">
          <div className="relative h-32 bg-gradient-to-br from-amber-500 to-orange-600">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Loader2 className="w-10 h-10 text-white animate-spin" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-neutral-50 to-transparent" />
          </div>
          <CardContent className="p-8 text-center space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {isConfirmingExtension ? "Confirming Extension..." : "Verifying Payment"}
              </h2>
              <p className="text-muted-foreground text-sm">
                {isConfirmingExtension
                  ? "Payment received! Finalizing your stay extension..."
                  : `Please wait while we confirm your transaction with ${method === "mpesa" ? "M-Pesa" : "our payment provider"}.`}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Transaction ID</span>
                <span className="font-mono font-medium">
                  {transactionId.slice(-12).toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-bold">{formatKES(amount)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="secondary" className="animate-pulse">
                  <Clock className="w-3 h-3 mr-1" />
                  {isConfirmingExtension ? "Confirming" : "Processing"}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-600 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${Math.min(attempts * 10, 90)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {isConfirmingExtension ? "Updating your booking..." : `Checking status... Attempt ${attempts}`}
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 text-left">
              <Shield className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Don't close this page</p>
                <p className="text-xs leading-relaxed">
                  {isConfirmingExtension
                    ? "We're updating your checkout date. This takes just a moment."
                    : "If you completed the M-Pesa PIN prompt, confirmation may take up to 30 seconds."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ==================== TIMEOUT STATE ====================
  if (status === "timeout") {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-0 shadow-2xl overflow-hidden">
          <div className="bg-amber-50 p-8 text-center">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-10 h-10 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Taking Longer Than Expected</h2>
            <p className="text-muted-foreground text-sm">
              We haven't received confirmation yet. Your payment may still be processing.
            </p>
          </div>
          <CardContent className="p-8 space-y-4">
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Transaction</span>
                <span className="font-mono">{transactionId.slice(-12).toUpperCase()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-bold">{formatKES(amount)}</span>
              </div>
            </div>
            <div className="space-y-2 pt-2">
              <Button
                className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold"
                onClick={handleRetry}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Check Again
              </Button>
              <Button variant="outline" className="w-full h-11 rounded-xl" asChild>
                <Link href="/mybookings">Go to My Bookings</Link>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              If you were charged but don't see confirmation, contact us at{" "}
              <a href="tel:+254759755575" className="text-amber-600 font-medium">+254 759 755 575</a>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ==================== FAILED STATE ====================
  if (status === "failed") {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-0 shadow-2xl overflow-hidden">
          <div className="bg-red-50 p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
            <p className="text-muted-foreground text-sm">
              We couldn't confirm your payment. No money was deducted.
            </p>
          </div>
          <CardContent className="p-8 space-y-4">
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-800">
              <p className="font-semibold mb-1">Common reasons:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Insufficient M-Pesa balance</li>
                <li>Wrong PIN entered</li>
                <li>Transaction cancelled on phone</li>
                <li>Network timeout</li>
              </ul>
            </div>
            <div className="space-y-2 pt-2">
              <Button
                className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold"
                onClick={() => window.history.back()}
              >
                Try Again
              </Button>
              <Button variant="outline" className="w-full h-11 rounded-xl" asChild>
                <Link href="/rooms">Browse Other Rooms</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ==================== SUCCESS STATE (your beautiful UI) ====================
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Confetti header */}
      <div className="relative bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
        <div className="relative container mx-auto px-4 py-16 max-w-4xl text-center text-white">
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/30 shadow-xl">
            <CheckCircle className="w-12 h-12" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            {mode === "extension" ? "Extension Confirmed!" : "Booking Confirmed!"}
          </h1>
          <p className="text-lg text-emerald-100 max-w-lg mx-auto mb-2">
            {mode === "extension"
              ? "Your stay has been extended successfully."
              : "Your reservation at Newtimes Luxury Haven is secured."}
          </p>
          <p className="text-sm text-emerald-200">
            A confirmation email with your receipt has been sent.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="#fafafa"
            />
          </svg>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl -mt-4 relative z-10">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Booking Details */}
          <div className="md:col-span-2 space-y-6">
            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="bg-white p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Booking Details</h2>
                    <p className="text-sm text-muted-foreground">
                      Reference: #{bookingId.slice(-8).toUpperCase()}
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100 px-3 py-1">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Confirmed
                  </Badge>
                </div>

                {room?.images?.[0] && (
                  <div className="relative h-48 md:h-64 rounded-2xl overflow-hidden mb-6">
                    <Image src={room.images[0]} alt={room.type} fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <p className="font-bold text-lg">{room.type}</p>
                      <p className="text-sm opacity-90 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        Room {room.roomNumber} • {room.view}
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-neutral-50 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Hotel className="w-4 h-4 text-amber-500" />
                      <span className="font-semibold uppercase tracking-wider text-xs">Stay Info</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Check-in</span>
                        <span className="font-medium">
                          {booking?.checkIn
                            ? new Date(booking.checkIn).toLocaleDateString("en-GB", {
                                weekday: "short", day: "numeric", month: "short", year: "numeric",
                              })
                            : "—"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Check-out</span>
                        <span className="font-medium">
                          {booking?.checkOut
                            ? new Date(booking.checkOut).toLocaleDateString("en-GB", {
                                weekday: "short", day: "numeric", month: "short", year: "numeric",
                              })
                            : "—"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duration</span>
                        <span className="font-medium">
                          {booking?.nights || 1} night{booking?.nights !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Guests</span>
                        <span className="font-medium">{booking?.guests || 1}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-neutral-50 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Smartphone className="w-4 h-4 text-amber-500" />
                      <span className="font-semibold uppercase tracking-wider text-xs">Payment</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Method</span>
                        <span className="font-medium capitalize">{method}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Amount</span>
                        <span className="font-bold text-amber-600">{formatKES(amount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <span className="text-green-600 font-medium">Paid</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                    Primary Guest
                  </h3>
                  <p className="text-sm">
                    <span className="font-medium">
                      {booking?.firstName} {booking?.lastName}
                    </span>
                    <span className="text-muted-foreground"> • {booking?.email}</span>
                  </p>
                </div>

                {booking?.specialRequests && (
                  <div className="mt-4 bg-amber-50 border border-amber-100 rounded-xl p-4">
                    <h3 className="font-semibold text-sm text-amber-800 mb-1">Special Requests</h3>
                    <p className="text-sm text-amber-700">{booking.specialRequests}</p>
                  </div>
                )}
              </div>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  What's Next?
                </h3>
                <div className="space-y-4">
                  {[
                    {
                      icon: Smartphone,
                      title: mode === "extension" ? "Extended stay confirmed" : "Check your email",
                      desc: mode === "extension"
                        ? "Your new checkout date has been updated. Check your email for the updated confirmation."
                        : "We've sent your booking confirmation and PDF receipt to your email address.",
                    },
                    {
                      icon: Clock,
                      title: "Check-in at 2:00 PM",
                      desc: "Present your booking reference at the front desk. Early check-in available upon request.",
                    },
                    {
                      icon: Shield,
                      title: "Free cancellation",
                      desc: "Cancel up to 24 hours before arrival for a full refund. Contact us for modifications.",
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{item.title}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="md:col-span-1 space-y-4">
            <Card className="border-0 shadow-xl sticky top-24">
              <CardContent className="p-6 space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="font-bold text-lg">All Set!</h3>
                  <p className="text-xs text-muted-foreground">
                    {mode === "extension" ? "Extension" : "Booking"} #{bookingId.slice(-8).toUpperCase()}
                  </p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Button
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold shadow-lg"
                    asChild
                  >
                    <Link href="/mybookings" className="flex items-center justify-center gap-2">
                      <CalendarDays className="w-4 h-4" />
                      My Bookings
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full h-11 rounded-xl" asChild>
                    <Link href="/" className="flex items-center justify-center gap-2">
                      <Home className="w-4 h-4" />
                      Back to Home
                    </Link>
                  </Button>
                  {receiptUrl && (
                    <Button variant="ghost" className="w-full h-11 rounded-xl text-amber-600" asChild>
                      <a href={receiptUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                        <FileText className="w-4 h-4" />
                        Download Receipt
                      </a>
                    </Button>
                  )}
                  <Button variant="ghost" className="w-full h-11 rounded-xl text-muted-foreground" onClick={() => window.print()}>
                    <Download className="w-4 h-4 mr-2" />
                    Print This Page
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}