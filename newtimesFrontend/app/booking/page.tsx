"use client"

import { useState, useMemo, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Star,
  Users,
  Calendar,
  CreditCard,
  Shield,
  CheckCircle,
  ArrowLeft,
  Clock,
  AlertCircle,
  FileText,
  Mail,
  Sparkles,
  Loader2,
  Lock,
  X,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { format, isValid, differenceInCalendarDays } from "date-fns"

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080/api"

function formatKES(amount: number) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const generateRoomData = (id: number) => {
  const roomTypes = [
    { type: "Standard", basePrice: 199, size: "25m²", capacity: 2 },
    { type: "Deluxe", basePrice: 299, size: "32m²", capacity: 2 },
    { type: "Superior", basePrice: 399, size: "40m²", capacity: 3 },
    { type: "Executive Suite", basePrice: 499, size: "65m²", capacity: 4 },
    { type: "Presidential Suite", basePrice: 899, size: "120m²", capacity: 6 },
  ]

  const safeId = Number(id) || 1
  const views = ["City View", "Ocean View", "Garden View", "Mountain View"]
  const roomType = roomTypes[(safeId - 1 + roomTypes.length) % roomTypes.length]
  const view = views[(safeId - 1 + views.length) % views.length]
  const priceVariation = Math.floor(Math.random() * 100) - 50

  return {
    id: safeId,
    roomNumber: 200 + safeId,
    type: roomType.type,
    price: roomType.basePrice + priceVariation,
    size: roomType.size,
    capacity: roomType.capacity,
    view,
    rating: Math.round((4.2 + Math.random() * 0.8) * 10) / 10,
    image: `luxury ${roomType.type.toLowerCase()} hotel room with ${view.toLowerCase()}`,
  }
}

export default function BookingPage() {
  const searchParams = useSearchParams()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)

  const roomId = searchParams.get("room")
  const checkInParam = searchParams.get("checkin")
  const checkOutParam = searchParams.get("checkout")
  const guestsParam = Number(searchParams.get("guests")) || 1
  const imageFromQuery = searchParams.get("image")

  const room = useMemo(() => generateRoomData(roomId), [roomId])

  const [backendRoom, setBackendRoom] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!roomId) return
    const fetchRoom = async () => {
      try {
        setLoading(true)
        const res = await fetch(`${backendUrl}/room/${roomId}`, { cache: "no-store" })
        if (!res.ok) throw new Error("Failed to fetch room")
        const data = await res.json()
        setBackendRoom({
          ...data,
          images:
            Array.isArray(data.data?.images) && data.data.images.length > 0
              ? data.data.images
              : imageFromQuery
              ? [imageFromQuery]
              : ["/placeholder.png"],
        })
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchRoom()
  }, [roomId, imageFromQuery])

  const [bookingData, setBookingData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "",
    checkIn: checkInParam ? new Date(checkInParam) : new Date(),
    checkOut: checkOutParam ? new Date(checkOutParam) : new Date(Date.now() + 86400000),
    guests: guestsParam,
    specialRequests: "",
    bedType: "king",
    smokingPreference: "non-smoking",
    floorPreference: "high",
    airportTransfer: false,
    earlyCheckIn: false,
    lateCheckOut: false,
    extraBed: false,
    agreeToTerms: false,
    subscribeNewsletter: false,
  })

  const nights = useMemo(() => {
    if (!isValid(bookingData.checkIn) || !isValid(bookingData.checkOut)) return 0
    return Math.max(differenceInCalendarDays(bookingData.checkOut, bookingData.checkIn), 1)
  }, [bookingData.checkIn, bookingData.checkOut])

  const pricePerNight = Number(backendRoom?.data?.price) || 0
  const roomTotal = pricePerNight * nights
  const addOnsTotal =
    (bookingData.airportTransfer ? 2500 : 0) +
    (bookingData.earlyCheckIn ? 1500 : 0) +
    (bookingData.lateCheckOut ? 1500 : 0) +
    (bookingData.extraBed ? 2000 * nights : 0)
  const serviceFee = 1
  const taxes = Math.round((roomTotal + addOnsTotal) * 0.16)
  const totalAmount = roomTotal + addOnsTotal + serviceFee + taxes

  const handleInputChange = (field: string, value: any) => {
    setBookingData((prev) => ({ ...prev, [field]: value }))
  }

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return !!(bookingData.firstName && bookingData.lastName && bookingData.email && bookingData.phone && bookingData.country)
      case 2:
        return bookingData.agreeToTerms
      default:
        return true
    }
  }

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
      if (currentStep + 1 === 2) {
        setShowTermsModal(true)
      }
    }
  }

  const handlePrevStep = () => currentStep > 1 && setCurrentStep(currentStep - 1)

  const handleConfirmTerms = () => {
    if (!bookingData.agreeToTerms) return
    setShowTermsModal(false)
  }

  const handleBookingSubmit = async () => {
    if (!isStepValid(2)) {
      setShowTermsModal(true)
      return
    }
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token");  // ✅ Get token from storage

      const res = await fetch(`${backendUrl}/bookings/book`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },  // ✅ Include token in header
        body: JSON.stringify({
          ...bookingData,
          roomId: backendRoom?.data?._id || roomId,
          roomType: room.type,
          roomNumber: room.roomNumber,
          pricePerNight,
          nights,
          roomTotal,
          addOnsTotal,
          serviceFee,
          taxes,
          totalAmount,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        const paymentParams = new URLSearchParams({
          bookingId: data.data._id,
          total: totalAmount.toString(),
          nights: nights.toString(),
          checkin: bookingData.checkIn.toISOString(),
          checkout: bookingData.checkOut.toISOString(),
          guests: bookingData.guests.toString(),
          firstName: bookingData.firstName,
          lastName: bookingData.lastName,
          email: bookingData.email,
        })
        window.location.href = `/payment?${paymentParams.toString()}`
      } else {
        alert(data.message || "Failed to create booking")
      }
    } catch (err) {
      alert("Server error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 pt-20">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-12 w-48" />
              <Skeleton className="h-96 w-full rounded-2xl" />
            </div>
            <div className="lg:col-span-1">
              <Skeleton className="h-80 w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !backendRoom) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold">Unable to Load Room</h2>
            <p className="text-muted-foreground text-sm">{error || "Room not found"}</p>
            <Button asChild className="mt-4 rounded-full">
              <Link href="/rooms" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Browse Rooms
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const steps = [
    { step: 1, label: "Guest Details", icon: Users },
    { step: 2, label: "Review", icon: CheckCircle },
    { step: 3, label: "Payment", icon: CreditCard },
  ]

  return (
    <div className="min-h-screen bg-neutral-50 relative">
      {/* Nav
      <nav className="sticky top-0 z-40 bg-white/85 backdrop-blur-2xl border-b border-neutral-200/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="gap-2 -ml-2" asChild>
              <Link href={`/rooms/${roomId}`}>
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </Link>
            </Button>
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">NH</span>
              </div>
              <span className="font-bold text-lg hidden sm:block">Newtimes Luxury Haven</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground bg-neutral-100 px-3 py-1.5 rounded-full">
              <Shield className="w-3 h-3" />
              Secure SSL
            </div>
          </div>
        </div>
      </nav> */}

      {/* Progress */}
      <section className="py-4 sm:py-6 bg-white border-b border-neutral-100">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-neutral-100 -translate-y-1/2 -z-10" />
            <div
              className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-600 -translate-y-1/2 -z-10 transition-all duration-500"
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            />
            {steps.map(({ step, label, icon: Icon }) => (
              <div key={step} className="flex flex-col items-center gap-2 bg-white px-2">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    currentStep >= step
                      ? "bg-gradient-to-r from-amber-500 to-orange-600 border-transparent text-white shadow-lg shadow-amber-500/25"
                      : "bg-white border-neutral-200 text-neutral-400"
                  } ${currentStep === step ? "scale-110" : ""}`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`text-xs font-semibold ${currentStep >= step ? "text-foreground" : "text-neutral-400"}`}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-7xl">
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Main */}
          <div className="lg:col-span-8 space-y-6">
            {currentStep === 1 && (
              <Card className="border-neutral-100 shadow-sm overflow-hidden">
                <CardHeader className="bg-neutral-50/50 border-b border-neutral-100 pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="w-5 h-5 text-amber-500" />
                    Guest Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wider">Personal Details</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="firstName" className="text-sm">First Name *</Label>
                        <Input id="firstName" value={bookingData.firstName} onChange={(e) => handleInputChange("firstName", e.target.value)} className="h-11 rounded-xl" placeholder="John" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="lastName" className="text-sm">Last Name *</Label>
                        <Input id="lastName" value={bookingData.lastName} onChange={(e) => handleInputChange("lastName", e.target.value)} className="h-11 rounded-xl" placeholder="Doe" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="email" className="text-sm">Email *</Label>
                        <Input id="email" type="email" value={bookingData.email} onChange={(e) => handleInputChange("email", e.target.value)} className="h-11 rounded-xl" placeholder="john@example.com" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="phone" className="text-sm">Phone *</Label>
                        <Input id="phone" value={bookingData.phone} onChange={(e) => handleInputChange("phone", e.target.value)} className="h-11 rounded-xl" placeholder="+254 712 345 678" />
                      </div>
                      <div className="sm:col-span-2 space-y-1.5">
                        <Label htmlFor="country" className="text-sm">Country *</Label>
                        <Input id="country" value={bookingData.country} onChange={(e) => handleInputChange("country", e.target.value)} className="h-11 rounded-xl" placeholder="Kenya" />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wider">Stay Dates</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-sm">Check-In</Label>
                        <Input
                          type="date"
                          value={isValid(bookingData.checkIn) ? bookingData.checkIn.toISOString().slice(0, 10) : ""}
                          min={new Date().toISOString().slice(0, 10)}
                          onChange={(e) => {
                            const d = new Date(e.target.value)
                            handleInputChange("checkIn", d)
                            if (bookingData.checkOut && d > bookingData.checkOut) handleInputChange("checkOut", d)
                          }}
                          className="h-11 rounded-xl"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm">Check-Out</Label>
                        <Input
                          type="date"
                          value={isValid(bookingData.checkOut) ? bookingData.checkOut.toISOString().slice(0, 10) : ""}
                          min={isValid(bookingData.checkIn) ? bookingData.checkIn.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)}
                          onChange={(e) => handleInputChange("checkOut", new Date(e.target.value))}
                          className="h-11 rounded-xl"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wider">Preferences</h3>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm mb-2 block">Bed Type</Label>
                        <RadioGroup value={bookingData.bedType} onValueChange={(v) => handleInputChange("bedType", v)} className="flex flex-wrap gap-3">
                          {["king", "queen", "twin"].map((type) => (
                            <div key={type} className="flex items-center space-x-2">
                              <RadioGroupItem value={type} id={type} />
                              <Label htmlFor={type} className="capitalize font-normal">{type} Bed</Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                      <div>
                        <Label className="text-sm mb-2 block">Smoking</Label>
                        <RadioGroup value={bookingData.smokingPreference} onValueChange={(v) => handleInputChange("smokingPreference", v)} className="flex flex-wrap gap-3">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="non-smoking" id="ns" />
                            <Label htmlFor="ns" className="font-normal">Non-Smoking</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="smoking" id="sm" />
                            <Label htmlFor="sm" className="font-normal">Smoking</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wider">Add-ons</h3>
                    <div className="space-y-3">
                      {[
                        { id: "airportTransfer", label: "Airport Transfer", desc: "Round-trip transport", price: 2500 },
                        { id: "earlyCheckIn", label: "Early Check-in", desc: "Before 2:00 PM", price: 1500 },
                        { id: "lateCheckOut", label: "Late Check-out", desc: "After 11:00 AM", price: 1500 },
                        { id: "extraBed", label: "Extra Bed", desc: "Per night", price: 2000 },
                      ].map((addon) => (
                        <div key={addon.id} className="flex items-center justify-between p-3 rounded-xl border border-neutral-100 hover:border-amber-200 hover:bg-amber-50/30 transition-all">
                          <div className="flex items-start gap-3">
                            <Checkbox
                              id={addon.id}
                              checked={bookingData[addon.id as keyof typeof bookingData] as boolean}
                              onCheckedChange={(checked) => handleInputChange(addon.id, checked)}
                            />
                            <div>
                              <Label htmlFor={addon.id} className="font-medium text-sm">{addon.label}</Label>
                              <p className="text-xs text-muted-foreground">{addon.desc}</p>
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-amber-600">+{formatKES(addon.price)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm">Special Requests</Label>
                    <Textarea
                      value={bookingData.specialRequests}
                      onChange={(e) => handleInputChange("specialRequests", e.target.value)}
                      placeholder="Any special requirements..."
                      className="rounded-xl min-h-[100px] resize-none"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <Card className="border-neutral-100 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Review Your Booking
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="bg-neutral-50 rounded-xl p-4 space-y-2">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Guest</h4>
                        <p className="text-sm font-medium">{bookingData.firstName} {bookingData.lastName}</p>
                        <p className="text-sm text-muted-foreground">{bookingData.email}</p>
                        <p className="text-sm text-muted-foreground">{bookingData.phone}</p>
                      </div>
                      <div className="bg-neutral-50 rounded-xl p-4 space-y-2">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Stay</h4>
                        <p className="text-sm font-medium">
                          {isValid(bookingData.checkIn) ? format(bookingData.checkIn, "EEE, MMM dd") : "—"} → {" "}
                          {isValid(bookingData.checkOut) ? format(bookingData.checkOut, "EEE, MMM dd") : "—"}
                        </p>
                        <p className="text-sm text-muted-foreground">{nights} night{nights !== 1 ? "s" : ""} • {bookingData.guests} guest{bookingData.guests !== 1 ? "s" : ""}</p>
                      </div>
                    </div>

                    <div className="bg-neutral-50 rounded-xl p-4 space-y-2">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Room Preferences</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span className="text-muted-foreground">Bed:</span>
                        <span className="font-medium capitalize">{bookingData.bedType}</span>
                        <span className="text-muted-foreground">Smoking:</span>
                        <span className="font-medium capitalize">{bookingData.smokingPreference}</span>
                        <span className="text-muted-foreground">Floor:</span>
                        <span className="font-medium capitalize">{bookingData.floorPreference}</span>
                      </div>
                    </div>

                    {bookingData.specialRequests && (
                      <div className="bg-neutral-50 rounded-xl p-4">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Special Requests</h4>
                        <p className="text-sm text-muted-foreground">{bookingData.specialRequests}</p>
                      </div>
                    )}

                    <div className="flex items-start gap-3 pt-2">
                      <Checkbox
                        id="subscribeNewsletter"
                        checked={bookingData.subscribeNewsletter}
                        onCheckedChange={(checked) => handleInputChange("subscribeNewsletter", checked)}
                        className="mt-0.5"
                      />
                      <div>
                        <Label htmlFor="subscribeNewsletter" className="font-medium text-sm cursor-pointer flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-neutral-400" />
                          Subscribe to newsletter
                        </Label>
                        <p className="text-xs text-muted-foreground mt-0.5">Get exclusive offers via email. Optional.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
                  <Sparkles className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-blue-900">Flexible Cancellation</h4>
                    <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                      Free cancellation up to 24 hours before arrival. Within 24 hours, one night's charge applies.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <Card className="border-neutral-100 shadow-lg lg:sticky lg:top-24 overflow-hidden">
              <div className="relative h-32 sm:h-40">
                <Image src={backendRoom.images[0]} alt={room.type} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-4 text-white">
                  <p className="font-bold text-lg">{room.type}</p>
                  <p className="text-xs opacity-90">Room {room.roomNumber} • {room.view}</p>
                </div>
              </div>
              <CardContent className="p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-semibold">{room.rating}</span>
                  </div>
                  <div className="text-xs bg-neutral-100 px-2 py-1 rounded-full font-medium">{nights} night{nights !== 1 ? "s" : ""}</div>
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{formatKES(pricePerNight)} × {nights} nights</span>
                    <span>{formatKES(roomTotal)}</span>
                  </div>
                  {addOnsTotal > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Add-ons</span>
                      <span>{formatKES(addOnsTotal)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service fee</span>
                    <span>{formatKES(serviceFee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Taxes (16%)</span>
                    <span>{formatKES(taxes)}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-amber-600">{formatKES(totalAmount)}</span>
                </div>

                <div className="pt-2 space-y-2">
                  {currentStep < 2 ? (
                    <Button
                      className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold shadow-lg shadow-amber-500/20"
                      onClick={handleNextStep}
                      disabled={!isStepValid(1)}
                    >
                      Continue to Review
                    </Button>
                  ) : (
                    <Button
                      className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold shadow-lg shadow-amber-500/20"
                      onClick={() => setShowTermsModal(true)}
                    >
                      <span className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        Proceed to Payment
                      </span>
                    </Button>
                  )}

                  {currentStep > 1 && (
                    <Button variant="outline" className="w-full h-11 rounded-xl bg-transparent" onClick={handlePrevStep}>
                      Back to Details
                    </Button>
                  )}
                </div>

                <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground pt-2">
                  <Shield className="w-3 h-3" />
                  256-bit SSL encrypted transaction
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* TERMS MODAL OVERLAY — covers entire page */}
      {showTermsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setShowTermsModal(false)} />
          
          {/* Modal Card */}
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-amber-100 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Terms & Conditions</h3>
                    <p className="text-xs text-amber-100">Required to complete your booking</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowTermsModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Warning if not checked */}
              {!bookingData.agreeToTerms && (
                <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-100">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>You must agree to the terms to continue with payment.</span>
                </div>
              )}

              {/* Checkbox */}
              <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-100">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="agreeToTermsModal"
                    checked={bookingData.agreeToTerms}
                    onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked)}
                    className="mt-0.5 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500 w-5 h-5"
                  />
                  <div>
                    <Label htmlFor="agreeToTermsModal" className="font-semibold text-sm leading-tight cursor-pointer">
                      I agree to the Terms and Conditions *
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                      By checking this box, you agree to our{" "}
                      <Link href="/terms" className="text-amber-600 hover:underline font-medium">Terms of Service</Link>
                      {" "}and{" "}
                      <Link href="/privacy" className="text-amber-600 hover:underline font-medium">Privacy Policy</Link>.
                      You confirm that all information provided is accurate and you accept the cancellation policy.
                    </p>
                  </div>
                </div>
              </div>

              {/* Policy summary */}
              <div className="space-y-3">
                <div className="flex items-start gap-3 text-sm">
                  <Clock className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Free cancellation up to 24 hours before arrival. Cancellations within 24 hours are charged for one night.</span>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <Lock className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Your payment information is encrypted and secure. We do not store your full card details.</span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 space-y-2">
                <Button
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold shadow-lg disabled:opacity-50"
                  disabled={!bookingData.agreeToTerms || isLoading}
                  onClick={handleBookingSubmit}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Confirm & Pay {formatKES(totalAmount)}
                    </span>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full h-10 text-sm text-muted-foreground hover:text-foreground"
                  onClick={() => setShowTermsModal(false)}
                >
                  Go back to review
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}