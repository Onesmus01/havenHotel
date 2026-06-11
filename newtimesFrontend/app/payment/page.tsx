"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CreditCard,
  Smartphone,
  Building2,
  Banknote,
  Shield,
  CheckCircle,
  ArrowLeft,
  Loader2,
  Lock,
  Clock,
  AlertCircle,
  ChevronRight,
  Star,
  Calendar,
  Users,
  BadgeCheck,
  Bed,
  MapPin,
  Plus,
  ArrowRightLeft,
  RefreshCw,
  X,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { format, isValid } from "date-fns";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080/api";

function formatKES(amount) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const mode = searchParams.get("mode") || "booking";
  const [extensionData, setExtensionData] = useState(null);

  const bookingId = searchParams.get("bookingId") || "";
  const total = Number(searchParams.get("total")) || 0;
  const nights = Number(searchParams.get("nights")) || 1;
  const checkin = searchParams.get("checkin");
  const checkout = searchParams.get("checkout");
  const guests = Number(searchParams.get("guests")) || 1;
  const firstName = searchParams.get("firstName") || "";
  const lastName = searchParams.get("lastName") || "";
  const email = searchParams.get("email") || "";
  const roomId = searchParams.get("room") || "";

  // ─── EXTENSION: read from sessionStorage ───
  useEffect(() => {
    if (mode === "extension") {
      const raw = sessionStorage.getItem("extensionPaymentData");
      if (raw) {
        try {
          const data = JSON.parse(raw);
          setExtensionData(data);
        } catch {
          router.push("/my-bookings");
        }
      } else {
        router.push("/my-bookings");
      }
    }
  }, [mode, router]);

  const [room, setRoom] = useState(null);
  const [loadingRoom, setLoadingRoom] = useState(true);

  const [method, setMethod] = useState("mpesa");
  const [phone, setPhone] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [txId, setTxId] = useState("");

  // Track pending payment conflict
  const [pendingConflict, setPendingConflict] = useState(false);
  const [pendingTxId, setPendingTxId] = useState("");

  const pollIntervalRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const isExtension = mode === "extension" && extensionData !== null;

  const displayTotal = isExtension ? extensionData?.extensionCost : total;
  const displayNights = isExtension ? extensionData?.additionalNights : nights;
  const displayCheckIn = isExtension ? extensionData?.currentCheckOut : checkin;
  const displayCheckOut = isExtension ? extensionData?.newCheckOut : checkout;
  const displayBookingId = isExtension ? extensionData?.bookingId : bookingId;
  const displayRoomId = isExtension ? extensionData?.originalBooking?.roomId : roomId;

  useEffect(() => {
    const targetRoomId = displayRoomId;
    if (!targetRoomId) {
      setLoadingRoom(false);
      return;
    }
    fetch(`${backendUrl}/room/${targetRoomId}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setRoom(data.data);
      })
      .catch(() => null)
      .finally(() => setLoadingRoom(false));
  }, [displayRoomId]);

  const checkInDate = useMemo(
    () => (displayCheckIn ? new Date(displayCheckIn) : null),
    [displayCheckIn]
  );
  const checkOutDate = useMemo(
    () => (displayCheckOut ? new Date(displayCheckOut) : null),
    [displayCheckOut]
  );

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // ─── CANCEL PENDING PAYMENT ───
  const cancelPendingPayment = async (pendingId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${backendUrl}/payments/mpesa/cancel/${pendingId}`, {
        method: "POST",
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setPendingConflict(false);
        setPendingTxId("");
        setErrorMsg("Previous payment cancelled. You can now retry.");
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // ─── HANDLE PAY ───
  const handlePay = async (force = false) => {
    setErrorMsg("");
    setPendingConflict(false);
    setIsProcessing(true);
    setPaymentStatus("processing");

    try {
      const token = localStorage.getItem("token");

      if (method === "mpesa") {
        if (!phone || phone.length < 9) {
          throw new Error("Enter a valid M-Pesa phone number");
        }

        const cleanPhone = phone.startsWith("0")
          ? `254${phone.slice(1)}`
          : phone;

        const payload = {
          phone: cleanPhone,
          amount: displayTotal,
          bookingId: displayBookingId,
          paymentType: isExtension ? "extension" : "booking",  // ← KEY FIX: send paymentType
          description: isExtension
            ? `Extend stay by ${displayNights} night${displayNights !== 1 ? "s" : ""}`
            : `Room booking - ${displayBookingId}`,
          ...(force && { force: true }),
        };

        const res = await fetch(`${backendUrl}/payments/mpesa/pay`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        // ─── HANDLE EXISTING PAYMENT CONFLICT ───
        if (res.status === 409 || data.error === "existing_payment") {
          setPendingConflict(true);
          setPendingTxId(data.pendingTxId || "");
          setErrorMsg(data.message || "You have a pending payment. Cancel it or wait for it to complete.");
          setIsProcessing(false);
          setPaymentStatus("idle");
          return;
        }

        if (!res.ok) {
          throw new Error(data.message || "M-Pesa request failed");
        }

        setTxId(data.transaction_id);

        // Navigate to verify page
        router.push(
          `/payment/verify?txId=${data.transaction_id}&mode=${mode}&bookingId=${displayBookingId}&amount=${displayTotal}&phone=${cleanPhone}`
        );

        setIsProcessing(false);
      } else if (method === "cash") {
        if (isExtension) {
          const res = await fetch(
            `${backendUrl}/bookings/${displayBookingId}/extend/confirm`,
            {
              method: "POST",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                paymentId: extensionData.extensionPaymentId,
                method: "cash",
              }),
            }
          );
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || "Failed to confirm");
          sessionStorage.removeItem("extensionPaymentData");
          setPaymentStatus("success");
        } else {
          const res = await fetch(`${backendUrl}/payments/cash/confirm`, {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ bookingId: displayBookingId }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || "Failed to confirm");
          setPaymentStatus("success");
        }
      } else {
        await new Promise((r) => setTimeout(r, 2000));
        setPaymentStatus("success");
      }
    } catch (err) {
      setErrorMsg(err.message);
      setPaymentStatus("failed");
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!txId) return;
    try {
      const token = localStorage.getItem("token");
      await fetch(`${backendUrl}/payments/mpesa/cancel/${txId}`, {
        method: "POST",
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
      });
      stopPolling();
      setPaymentStatus("failed");
      setErrorMsg("Payment cancelled");
      setIsProcessing(false);
    } catch {
      /* ignore */
    }
  };

  const paymentMethods = [
    {
      id: "mpesa",
      label: "M-Pesa",
      sub: "STK Push to your phone",
      icon: Smartphone,
      color: "bg-green-500",
    },
    {
      id: "card",
      label: "Credit / Debit Card",
      sub: "Visa, Mastercard",
      icon: CreditCard,
      color: "bg-blue-500",
    },
    {
      id: "bank",
      label: "Bank Transfer",
      sub: "KCB, Equity, Co-op",
      icon: Building2,
      color: "bg-amber-500",
    },
    {
      id: "cash",
      label: "Pay on Arrival",
      sub: "Settle at front desk",
      icon: Banknote,
      color: "bg-neutral-500",
    },
  ];

  // ─── SUCCESS SCREEN ───
  if (paymentStatus === "success") {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-0 shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 sm:p-8 text-white text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2">
              {isExtension ? "Extension Confirmed!" : "Booking Confirmed!"}
            </h2>
            <p className="text-green-100 text-sm sm:text-base">
              {isExtension
                ? "Your stay has been extended successfully."
                : "Your reservation is secured."}
            </p>
          </div>
          <CardContent className="p-5 sm:p-6 space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {isExtension ? "Extension ID" : "Booking ID"}
                </span>
                <span className="font-mono font-medium">
                  {displayBookingId.slice(-8).toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-bold text-green-600">
                  {formatKES(displayTotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Method</span>
                <span className="font-medium capitalize">{method}</span>
              </div>
              {isExtension && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">New Checkout</span>
                  <span className="font-medium">
                    {checkOutDate && isValid(checkOutDate)
                      ? format(checkOutDate, "MMM dd, yyyy")
                      : "—"}
                  </span>
                </div>
              )}
            </div>
            <Separator />
            <p className="text-xs text-muted-foreground text-center">
              Confirmation sent to{" "}
              <span className="font-medium text-foreground">{email || extensionData?.originalBooking?.email}</span>
            </p>
            <Button
              className="w-full h-11 sm:h-12 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold"
              asChild
            >
              <Link href="/my-bookings">View My Bookings</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-7xl">
        {/* Extension Banner */}
        {isExtension && (
          <div className="mb-4 sm:mb-6 bg-blue-50 border border-blue-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <ArrowRightLeft className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-blue-900 text-sm sm:text-base">Extending Your Stay</p>
              <p className="text-xs sm:text-sm text-blue-700">
                Adding <strong>{extensionData?.additionalNights} night{extensionData?.additionalNights !== 1 ? "s" : ""}</strong> to your booking
              </p>
              <p className="text-[10px] sm:text-xs text-blue-600 mt-0.5">
                New checkout:{" "}
                {checkOutDate && isValid(checkOutDate)
                  ? format(checkOutDate, "EEE, MMM dd, yyyy")
                  : "—"}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-base sm:text-lg font-bold text-blue-800">
                {formatKES(extensionData?.extensionCost)}
              </p>
              <p className="text-[10px] sm:text-xs text-blue-600">
                KES {extensionData?.originalBooking?.pricePerNight?.toLocaleString()}/night
              </p>
            </div>
          </div>
        )}

        {/* PENDING PAYMENT CONFLICT BANNER */}
        {pendingConflict && (
          <div className="mb-4 sm:mb-6 bg-amber-50 border border-amber-200 rounded-xl sm:rounded-2xl p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-amber-900 text-sm sm:text-base">Payment Already in Progress</p>
                <p className="text-xs sm:text-sm text-amber-700 mt-1">
                  You have a pending M-Pesa payment that hasn't completed yet. You can cancel it and try again, or wait for it to finish.
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-lg border-amber-300 text-amber-700 hover:bg-amber-100 text-xs sm:text-sm h-9"
                    onClick={() => cancelPendingPayment(pendingTxId)}
                    disabled={isProcessing}
                  >
                    <X className="w-3.5 h-3.5 mr-1" />
                    Cancel Old Payment
                  </Button>
                  <Button
                    size="sm"
                    className="rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm h-9"
                    onClick={() => handlePay(true)}
                    disabled={isProcessing}
                  >
                    <RefreshCw className="w-3.5 h-3.5 mr-1" />
                    Retry Anyway
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Main Payment */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-4 sm:space-y-6">
            {/* Guest Banner */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 border border-neutral-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0">
                  <BadgeCheck className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-xs sm:text-sm truncate">
                    {isExtension
                      ? `Extending for ${extensionData?.originalBooking?.firstName || firstName} ${extensionData?.originalBooking?.lastName || lastName}`
                      : `Booking for ${firstName} ${lastName}`}
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                    {email || extensionData?.originalBooking?.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs md:text-sm text-muted-foreground bg-neutral-50 px-3 sm:px-4 py-2 rounded-xl w-fit">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span>
                    {checkInDate && isValid(checkInDate)
                      ? format(checkInDate, "MMM dd")
                      : "—"}{" "}
                    →{" "}
                    {checkOutDate && isValid(checkOutDate)
                      ? format(checkOutDate, "MMM dd")
                      : "—"}
                  </span>
                </div>
                <Separator orientation="vertical" className="h-3 sm:h-4" />
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span>
                    {isExtension
                      ? extensionData?.originalBooking?.guests || guests
                      : guests}{" "}
                    guest
                    {(isExtension
                      ? extensionData?.originalBooking?.guests || guests
                      : guests) !== 1
                      ? "s"
                      : ""}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="space-y-2 sm:space-y-3">
              <h3 className="font-semibold text-xs sm:text-sm text-muted-foreground uppercase tracking-wider">
                Select Payment Method
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {paymentMethods.map((m) => {
                  const Icon = m.icon;
                  const active = method === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => {
                        setMethod(m.id);
                        setPaymentStatus("idle");
                        setErrorMsg("");
                        setPendingConflict(false);
                      }}
                      className={`relative flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border-2 transition-all text-left ${
                        active
                          ? "border-amber-500 bg-amber-50/50 shadow-md"
                          : "border-neutral-100 bg-white hover:border-neutral-200"
                      }`}
                    >
                      <div
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg ${m.color} flex items-center justify-center flex-shrink-0 text-white shadow-sm`}
                      >
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-xs sm:text-sm">{m.label}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                          {m.sub}
                        </p>
                      </div>
                      {active && (
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Payment Form */}
            <Card className="border-neutral-100 shadow-sm overflow-hidden">
              <CardHeader className="bg-neutral-50/50 border-b border-neutral-100 pb-3 sm:pb-4 px-4 sm:px-6">
                <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                  {method === "mpesa" && (
                    <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  )}
                  {method === "card" && (
                    <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  )}
                  {method === "bank" && (
                    <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                  )}
                  {method === "cash" && (
                    <Banknote className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-600" />
                  )}
                  Pay with {paymentMethods.find((m) => m.id === method)?.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">
                {errorMsg && (
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-red-700 bg-red-50 p-2.5 sm:p-3 rounded-xl border border-red-100">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {errorMsg}
                  </div>
                )}

                {method === "mpesa" && (
                  <div className="space-y-3 sm:space-y-4">
                    <div className="bg-green-50 border border-green-100 rounded-xl p-3 sm:p-4 flex gap-2.5 sm:gap-3">
                      <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="text-xs sm:text-sm text-green-800">
                        <p className="font-semibold mb-0.5 sm:mb-1">M-Pesa Express</p>
                        <p className="text-[10px] sm:text-xs leading-relaxed">
                          You will receive an STK push on your phone. Enter your
                          M-Pesa PIN to complete payment.
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1 sm:space-y-1.5">
                      <Label className="text-xs sm:text-sm">M-Pesa Phone Number</Label>
                      <Input
                        placeholder="e.g. 0712 345 678"
                        value={phone}
                        onChange={(e) =>
                          setPhone(e.target.value.replace(/\D/g, ""))
                        }
                        className="h-10 sm:h-11 rounded-xl text-sm"
                        maxLength={12}
                      />
                      <p className="text-[10px] sm:text-xs text-muted-foreground">
                        Format: 07XX XXX XXX or 2547XX XXX XXX
                      </p>
                    </div>
                  </div>
                )}

                {method === "card" && (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 sm:p-4 flex gap-2.5 sm:gap-3">
                    <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-xs sm:text-sm text-blue-800">
                      <p className="font-semibold mb-0.5 sm:mb-1">
                        Card Payments Coming Soon
                      </p>
                      <p className="text-[10px] sm:text-xs leading-relaxed">
                        We are integrating Stripe for secure card processing.
                        Please use M-Pesa for now.
                      </p>
                    </div>
                  </div>
                )}

                {method === "bank" && (
                  <div className="space-y-3 sm:space-y-4">
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 sm:p-4 space-y-2 sm:space-y-3">
                      <p className="font-semibold text-xs sm:text-sm text-amber-900">
                        Bank Transfer Details
                      </p>
                      <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Bank:</span>
                          <span className="font-medium">KCB Bank Kenya</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Account Name:
                          </span>
                          <span className="font-medium">
                            Newtimes Luxury Haven Ltd
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Account No:
                          </span>
                          <span className="font-medium font-mono">
                            1234567890
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Branch Code:
                          </span>
                          <span className="font-medium">012</span>
                        </div>
                      </div>
                      <p className="text-[10px] sm:text-xs text-amber-700">
                        Use your Booking ID as reference. Contact us after
                        transfer.
                      </p>
                    </div>
                  </div>
                )}

                {method === "cash" && (
                  <div className="bg-neutral-50 border border-neutral-100 rounded-xl p-3 sm:p-4 flex gap-2.5 sm:gap-3">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-500 flex-shrink-0 mt-0.5" />
                    <div className="text-xs sm:text-sm text-neutral-700">
                      <p className="font-semibold mb-0.5 sm:mb-1">Pay at Reception</p>
                      <p className="text-[10px] sm:text-xs leading-relaxed">
                        No upfront payment required. Settle the full amount
                        during check-in. Your booking will be held for 24 hours.
                      </p>
                    </div>
                  </div>
                )}

                <Separator />

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <Button
                    className="flex-1 h-11 sm:h-12 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold shadow-lg disabled:opacity-60 text-sm"
                    onClick={() => handlePay(false)}
                    disabled={
                      isProcessing || method === "card" || method === "bank"
                    }
                  >
                    {isProcessing ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        {method === "cash"
                          ? isExtension
                            ? "Confirm Extension"
                            : "Confirm Booking"
                          : `Pay ${formatKES(displayTotal)}`}
                      </span>
                    )}
                  </Button>
                  {isProcessing && method === "mpesa" && (
                    <Button
                      variant="outline"
                      className="h-11 sm:h-12 rounded-xl px-4 sm:px-6 text-sm"
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                  )}
                </div>

                <p className="text-[10px] sm:text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
                  <Shield className="w-3 h-3" />
                  256-bit SSL encryption • PCI-DSS Compliant
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-5 xl:col-span-4">
            <Card className="border-neutral-100 shadow-lg lg:sticky lg:top-24 overflow-hidden">
              {loadingRoom ? (
                <Skeleton className="h-32 sm:h-40 w-full" />
              ) : room?.images?.[0] ? (
                <div className="relative h-32 sm:h-40">
                  <Image
                    src={room.images[0]}
                    alt={room.type}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 sm:left-4 text-white">
                    <p className="font-bold text-sm sm:text-base">{room.type}</p>
                    <p className="text-[10px] sm:text-xs opacity-90 flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Room {room.roomNumber} •{" "}
                      {room.view}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="h-32 sm:h-40 bg-neutral-100 flex items-center justify-center">
                  <Bed className="w-6 h-6 sm:w-8 sm:h-8 text-neutral-300" />
                </div>
              )}

              <CardContent className="p-3 sm:p-4 md:p-5 space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400 text-amber-400" />
                    <span className="text-xs sm:text-sm font-semibold">
                      {room?.rating || "4.5"}
                    </span>
                  </div>
                  <div className="text-[10px] sm:text-xs bg-neutral-100 px-2 py-1 rounded-full font-medium">
                    {displayNights} night{displayNights !== 1 ? "s" : ""}
                  </div>
                </div>

                <Separator />

                <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {isExtension ? "Extension Cost" : "Room Total"}
                    </span>
                    <span>{formatKES(displayTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service Fee</span>
                    <span className="text-green-600">Included</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Taxes</span>
                    <span className="text-green-600">Included</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between font-bold text-base sm:text-lg">
                  <span>Total Due</span>
                  <span className="text-amber-600">
                    {formatKES(displayTotal)}
                  </span>
                </div>

                <div className="bg-neutral-50 rounded-xl p-2.5 sm:p-3 space-y-1.5 sm:space-y-2">
                  <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Guest
                  </p>
                  <p className="text-xs sm:text-sm font-medium">
                    {isExtension
                      ? `${extensionData?.originalBooking?.firstName || firstName} ${
                          extensionData?.originalBooking?.lastName || lastName
                        }`
                      : `${firstName} ${lastName}`}
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    {email || extensionData?.originalBooking?.email}
                  </p>
                </div>

                <div className="bg-neutral-50 rounded-xl p-2.5 sm:p-3 space-y-1">
                  <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Stay Dates
                  </p>
                  <p className="text-xs sm:text-sm">
                    {checkInDate && isValid(checkInDate)
                      ? format(checkInDate, "EEE, MMM dd, yyyy")
                      : "—"}
                  </p>
                  <p className="text-xs sm:text-sm">
                    {checkOutDate && isValid(checkOutDate)
                      ? format(checkOutDate, "EEE, MMM dd, yyyy")
                      : "—"}
                  </p>
                </div>

                {isExtension && (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-2.5 sm:p-3 space-y-1">
                    <p className="text-[10px] sm:text-xs font-semibold text-blue-700 uppercase tracking-wider">
                      Extension Details
                    </p>
                    <p className="text-xs sm:text-sm text-blue-900">
                      +{extensionData?.additionalNights} night
                      {extensionData?.additionalNights !== 1 ? "s" : ""}
                    </p>
                    <p className="text-[10px] sm:text-xs text-blue-600">
                      From{" "}
                      {new Date(
                        extensionData?.currentCheckOut
                      ).toLocaleDateString()}{" "}
                      to{" "}
                      {new Date(
                        extensionData?.newCheckOut
                      ).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}