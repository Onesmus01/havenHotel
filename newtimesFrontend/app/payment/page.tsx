"use client"

import { useState, useEffect, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
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
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { format, isValid } from "date-fns"

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080/api"

function formatKES(amount: number) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

type PaymentMethod = "mpesa" | "card" | "bank" | "cash"

export default function PaymentPage() {
  const searchParams = useSearchParams()

  // Inherited booking details from URL
  const bookingId = searchParams.get("bookingId") || ""
  const total = Number(searchParams.get("total")) || 0
  const nights = Number(searchParams.get("nights")) || 1
  const checkin = searchParams.get("checkin")
  const checkout = searchParams.get("checkout")
  const guests = Number(searchParams.get("guests")) || 1
  const firstName = searchParams.get("firstName") || ""
  const lastName = searchParams.get("lastName") || ""
  const email = searchParams.get("email") || ""
  const roomId = searchParams.get("room") || ""

  const [room, setRoom] = useState<any>(null)
  const [loadingRoom, setLoadingRoom] = useState(true)

  const [method, setMethod] = useState<PaymentMethod>("mpesa")
  const [phone, setPhone] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "failed">("idle")
  const [errorMsg, setErrorMsg] = useState("")
  const [txId, setTxId] = useState("")

  // Fetch room details for sidebar
  useEffect(() => {
    if (!roomId) { setLoadingRoom(false); return }
    fetch(`${backendUrl}/room/${roomId}`, { cache: "no-store" })
      .then(r => r.json())
      .then(data => { if (data.success) setRoom(data.data) })
      .catch(() => null)
      .finally(() => setLoadingRoom(false))
  }, [roomId])

  const checkInDate = useMemo(() => (checkin ? new Date(checkin) : null), [checkin])
  const checkOutDate = useMemo(() => (checkout ? new Date(checkout) : null), [checkout])

  const handlePay = async () => {
    setErrorMsg("")
    setIsProcessing(true)
    setPaymentStatus("processing")

    try {
          const token = localStorage.getItem("token");


      if (method === "mpesa") {
        if (!phone || phone.length < 9) throw new Error("Enter a valid M-Pesa phone number")

        const cleanPhone = phone.startsWith("0") ? `254${phone.slice(1)}` : phone

        const res = await fetch(`${backendUrl}/payments/mpesa/pay`, {
          method: "POST",
          credentials: "include",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            phone: cleanPhone,
            amount: total,
            bookingId,
          }),
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.message || "M-Pesa request failed")

        setTxId(data.transaction_id)

        // Poll for status
        const pollInterval = setInterval(async () => {
          const statusRes = await fetch(`${backendUrl}/payments/mpesa/status/${data.transaction_id}`, {
            credentials: "include",
            headers: {
              "Authorization": `Bearer ${token}`
            }
          })
          const statusData = await statusRes.json()

          if (statusData.status === "success") {
            clearInterval(pollInterval)
            setPaymentStatus("success")
            setIsProcessing(false)
          } else if (["failed", "cancelled"].includes(statusData.status)) {
            clearInterval(pollInterval)
            setPaymentStatus("failed")
            setErrorMsg(statusData.message)
            setIsProcessing(false)
          }
        }, 3000)

        // Stop polling after 90 seconds
        setTimeout(() => {
          clearInterval(pollInterval)
          if (paymentStatus === "processing") {
            setPaymentStatus("failed")
            setErrorMsg("Payment timed out. Please check your M-Pesa messages.")
            setIsProcessing(false)
          }
        }, 90000)

      } else if (method === "cash") {
        // Cash on arrival — just confirm booking
        const res = await fetch(`${backendUrl}/payments/cash/confirm`, {
          method: "POST",
          credentials: "include",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ bookingId }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || "Failed to confirm")
        setPaymentStatus("success")

      } else {
        // Card / Bank — simulate for now, integrate Stripe/Flutterwave later
        await new Promise(r => setTimeout(r, 2000))
        setPaymentStatus("success")
      }
    } catch (err: any) {
      setErrorMsg(err.message)
      setPaymentStatus("failed")
      setIsProcessing(false)
    }
  }

  const handleCancel = async () => {
    if (!txId) return
    try {
          const token = localStorage.getItem("token");

      await fetch(`${backendUrl}/payments/mpesa/cancel/${txId}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      setPaymentStatus("failed")
      setErrorMsg("Payment cancelled")
      setIsProcessing(false)
    } catch { /* ignore */ }
  }

  const paymentMethods = [
    {
      id: "mpesa" as PaymentMethod,
      label: "M-Pesa",
      sub: "STK Push to your phone",
      icon: Smartphone,
      color: "bg-green-500",
    },
    {
      id: "card" as PaymentMethod,
      label: "Credit / Debit Card",
      sub: "Visa, Mastercard",
      icon: CreditCard,
      color: "bg-blue-500",
    },
    {
      id: "bank" as PaymentMethod,
      label: "Bank Transfer",
      sub: "KCB, Equity, Co-op",
      icon: Building2,
      color: "bg-amber-500",
    },
    {
      id: "cash" as PaymentMethod,
      label: "Pay on Arrival",
      sub: "Settle at front desk",
      icon: Banknote,
      color: "bg-neutral-500",
    },
  ]

  if (paymentStatus === "success") {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-0 shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-8 text-white text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
            <p className="text-green-100">Your reservation is secured.</p>
          </div>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Booking ID</span>
                <span className="font-mono font-medium">{bookingId.slice(-8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-bold text-green-600">{formatKES(total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Method</span>
                <span className="font-medium capitalize">{method}</span>
              </div>
            </div>
            <Separator />
            <p className="text-xs text-muted-foreground text-center">
              Confirmation sent to <span className="font-medium text-foreground">{email}</span>
            </p>
            <Button className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold" asChild>
              <Link href="/dashboard">View My Bookings</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Nav */}
      

      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-7xl">
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Main Payment */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            {/* Guest Banner */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-neutral-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0">
                  <BadgeCheck className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Booking for {firstName} {lastName}</p>
                  <p className="text-xs text-muted-foreground">{email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs sm:text-sm text-muted-foreground bg-neutral-50 px-4 py-2 rounded-xl">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {checkInDate && isValid(checkInDate) ? format(checkInDate, "MMM dd") : "—"} → {" "}
                    {checkOutDate && isValid(checkOutDate) ? format(checkOutDate, "MMM dd") : "—"}
                  </span>
                </div>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>{guests} guest{guests !== 1 ? "s" : ""}</span>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Select Payment Method</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {paymentMethods.map((m) => {
                  const Icon = m.icon
                  const active = method === m.id
                  return (
                    <button
                      key={m.id}
                      onClick={() => { setMethod(m.id); setPaymentStatus("idle"); setErrorMsg("") }}
                      className={`relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                        active ? "border-amber-500 bg-amber-50/50 shadow-md" : "border-neutral-100 bg-white hover:border-neutral-200"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg ${m.color} flex items-center justify-center flex-shrink-0 text-white shadow-sm`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">{m.label}</p>
                        <p className="text-xs text-muted-foreground truncate">{m.sub}</p>
                      </div>
                      {active && (
                        <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Payment Form */}
            <Card className="border-neutral-100 shadow-sm overflow-hidden">
              <CardHeader className="bg-neutral-50/50 border-b border-neutral-100 pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  {method === "mpesa" && <Smartphone className="w-5 h-5 text-green-600" />}
                  {method === "card" && <CreditCard className="w-5 h-5 text-blue-600" />}
                  {method === "bank" && <Building2 className="w-5 h-5 text-amber-600" />}
                  {method === "cash" && <Banknote className="w-5 h-5 text-neutral-600" />}
                  Pay with {paymentMethods.find(m => m.id === method)?.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-4">
                {errorMsg && (
                  <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 p-3 rounded-xl border border-red-100">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {errorMsg}
                  </div>
                )}

                {method === "mpesa" && (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex gap-3">
                      <Smartphone className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-green-800">
                        <p className="font-semibold mb-1">M-Pesa Express</p>
                        <p className="text-xs leading-relaxed">You will receive an STK push on your phone. Enter your M-Pesa PIN to complete payment.</p>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm">M-Pesa Phone Number</Label>
                      <Input
                        placeholder="e.g. 0712 345 678"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                        className="h-11 rounded-xl"
                        maxLength={12}
                      />
                      <p className="text-[10px] text-muted-foreground">Format: 07XX XXX XXX or 2547XX XXX XXX</p>
                    </div>
                  </div>
                )}

                {method === "card" && (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
                    <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-semibold mb-1">Card Payments Coming Soon</p>
                      <p className="text-xs leading-relaxed">We are integrating Stripe for secure card processing. Please use M-Pesa for now.</p>
                    </div>
                  </div>
                )}

                {method === "bank" && (
                  <div className="space-y-4">
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-3">
                      <p className="font-semibold text-sm text-amber-900">Bank Transfer Details</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-muted-foreground">Bank:</span><span className="font-medium">KCB Bank Kenya</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Account Name:</span><span className="font-medium">Newtimes Luxury Haven Ltd</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Account No:</span><span className="font-medium font-mono">1234567890</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Branch Code:</span><span className="font-medium">012</span></div>
                      </div>
                      <p className="text-xs text-amber-700">Use your Booking ID as reference. Contact us after transfer.</p>
                    </div>
                  </div>
                )}

                {method === "cash" && (
                  <div className="bg-neutral-50 border border-neutral-100 rounded-xl p-4 flex gap-3">
                    <Clock className="w-5 h-5 text-neutral-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-neutral-700">
                      <p className="font-semibold mb-1">Pay at Reception</p>
                      <p className="text-xs leading-relaxed">No upfront payment required. Settle the full amount during check-in. Your booking will be held for 24 hours.</p>
                    </div>
                  </div>
                )}

                <Separator />

                <div className="flex gap-3">
                  <Button
                    className="flex-1 h-12 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold shadow-lg disabled:opacity-60"
                    onClick={handlePay}
                    disabled={isProcessing || (method === "card") || (method === "bank")}
                  >
                    {isProcessing ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        {method === "cash" ? "Confirm Booking" : `Pay ${formatKES(total)}`}
                      </span>
                    )}
                  </Button>
                  {isProcessing && method === "mpesa" && (
                    <Button variant="outline" className="h-12 rounded-xl px-6" onClick={handleCancel}>
                      Cancel
                    </Button>
                  )}
                </div>

                <p className="text-[10px] text-muted-foreground text-center flex items-center justify-center gap-1">
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
                <Skeleton className="h-40 w-full" />
              ) : room?.images?.[0] ? (
                <div className="relative h-40">
                  <Image src={room.images[0]} alt={room.type} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-4 text-white">
                    <p className="font-bold">{room.type}</p>
                    <p className="text-xs opacity-90 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Room {room.roomNumber} • {room.view}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="h-40 bg-neutral-100 flex items-center justify-center">
                  <Bed className="w-8 h-8 text-neutral-300" />
                </div>
              )}

              <CardContent className="p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-semibold">{room?.rating || "4.5"}</span>
                  </div>
                  <div className="text-xs bg-neutral-100 px-2 py-1 rounded-full font-medium">{nights} night{nights !== 1 ? "s" : ""}</div>
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Room Total</span>
                    <span>{formatKES(total)}</span>
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

                <div className="flex justify-between font-bold text-lg">
                  <span>Total Due</span>
                  <span className="text-amber-600">{formatKES(total)}</span>
                </div>

                <div className="bg-neutral-50 rounded-xl p-3 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Guest</p>
                  <p className="text-sm font-medium">{firstName} {lastName}</p>
                  <p className="text-xs text-muted-foreground">{email}</p>
                </div>

                <div className="bg-neutral-50 rounded-xl p-3 space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Stay Dates</p>
                  <p className="text-sm">{checkInDate && isValid(checkInDate) ? format(checkInDate, "EEE, MMM dd, yyyy") : "—"}</p>
                  <p className="text-sm">{checkOutDate && isValid(checkOutDate) ? format(checkOutDate, "EEE, MMM dd, yyyy") : "—"}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}