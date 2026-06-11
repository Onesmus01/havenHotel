"use client";

import { useState, useEffect, useContext, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Context } from "@/context/userContext.js";
import {
  Star,
  Users,
  Bed,
  Wifi,
  Coffee,
  ArrowLeft,
  CalendarIcon,
  MapPin,
  Phone,
  Mail,
  Clock,
  Heart,
  CheckCircle,
  Maximize,
  Thermometer,
  Tv,
  Shield,
  Zap,
  Droplets,
  Wind,
  Car,
  Utensils,
  Sparkles,
  Ban,
  Dog,
  CreditCard,
  ChevronRight,
  ShieldCheck,
  Share2,
  AlertCircle,
  Loader2,
  Gem,
  ArrowRight,
  X,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { format, differenceInCalendarDays, addDays, isValid } from "date-fns";
import { cn } from "@/lib/utils";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080/api";

const amenityIconMap = {
  wifi: Wifi,
  coffee: Coffee,
  tv: Tv,
  ac: Wind,
  heating: Thermometer,
  shower: Droplets,
  parking: Car,
  restaurant: Utensils,
  security: Shield,
  power: Zap,
  spa: Sparkles,
  pets: Dog,
  default: CheckCircle,
};

function getAmenityIcon(iconName) {
  if (!iconName) return amenityIconMap.default;
  return amenityIconMap[iconName.toLowerCase()] || amenityIconMap.default;
}

function formatKES(amount) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Helper: format date to YYYY-MM-DD for input
function toInputDate(date) {
  if (!date || !isValid(date)) return "";
  return date.toISOString().slice(0, 10);
}

// Helper: get today's date as YYYY-MM-DD for min attribute
function todayInput() {
  return new Date().toISOString().slice(0, 10);
}

export default function RoomDetailPage({ params }) {
  const [checkInDate, setCheckInDate] = useState();
  const [checkOutDate, setCheckOutDate] = useState();
  const [guests, setGuests] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const roomId = params.id;
  const { user } = useContext(Context);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${backendUrl}/room/${roomId}`);
        const data = await res.json();

        if (data.success) {
          setRoom(data.data);
        } else {
          setError(data.message || "Failed to fetch room details");
        }
      } catch (err) {
        setError("Unable to connect to the server. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [roomId]);

  const calculateNights = useCallback(() => {
    if (checkInDate && checkOutDate) {
      return Math.max(differenceInCalendarDays(checkOutDate, checkInDate), 1);
    }
    return 0;
  }, [checkInDate, checkOutDate]);

  const nights = calculateNights();
  const subtotal = room ? room.price * nights : 0;
  const serviceFee = nights > 0 ? 2500 : 0;
  const taxes = nights > 0 ? Math.round(subtotal * 0.16) : 0;
  const totalPrice = subtotal + serviceFee + taxes;

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: `${room?.type} at Newtimes Luxury Haven`,
        text: room?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };

  // Handle check-in change
  const handleCheckIn = (e) => {
    const val = e.target.value;
    if (!val) {
      setCheckInDate(undefined);
      return;
    }
    const d = new Date(val);
    d.setHours(12, 0, 0, 0); // noon to avoid timezone issues
    setCheckInDate(d);
    // Reset checkout if it's before or same as new checkin
    if (checkOutDate && d >= checkOutDate) {
      setCheckOutDate(undefined);
    }
  };

  // Handle check-out change
  const handleCheckOut = (e) => {
    const val = e.target.value;
    if (!val) {
      setCheckOutDate(undefined);
      return;
    }
    const d = new Date(val);
    d.setHours(12, 0, 0, 0);
    setCheckOutDate(d);
  };

  // Loading Skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="container mx-auto px-3 sm:px-4 py-16 sm:py-24 max-w-7xl">
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              <Skeleton className="h-[280px] sm:h-[400px] lg:h-[500px] w-full rounded-2xl" />
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 sm:gap-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-16 sm:h-24 rounded-xl" />
                ))}
              </div>
              <Skeleton className="h-10 sm:h-12 w-full rounded-lg" />
              <div className="space-y-3 sm:space-y-4">
                <Skeleton className="h-6 sm:h-8 w-1/3 rounded-lg" />
                <Skeleton className="h-3 sm:h-4 w-full rounded-lg" />
                <Skeleton className="h-3 sm:h-4 w-3/4 rounded-lg" />
              </div>
            </div>
            <div className="lg:col-span-1">
              <Skeleton className="h-[350px] sm:h-[400px] w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !room) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full border-0 shadow-xl">
          <CardContent className="p-6 sm:p-8 text-center space-y-4 sm:space-y-5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7 sm:w-8 sm:h-8 text-red-500" />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-foreground">Unable to Load Room</h2>
            <p className="text-muted-foreground text-sm sm:text-base">{error || "Room not found"}</p>
            <Button
              asChild
              className="mt-4 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl"
            >
              <Link href="/rooms" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Browse All Rooms
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const reviews = [
    {
      name: "Jennifer Smith",
      rating: 5,
      date: "2 weeks ago",
      comment:
        "Absolutely stunning room with incredible views. The service was exceptional and every detail was perfect.",
      verified: true,
      avatar: "JS",
    },
    {
      name: "David Chen",
      rating: 5,
      date: "1 month ago",
      comment:
        "Best hotel experience I've had. The room was spacious, clean, and the amenities were top-notch.",
      verified: true,
      avatar: "DC",
    },
    {
      name: "Maria Rodriguez",
      rating: 4,
      date: "2 months ago",
      comment:
        "Beautiful room and great location. The staff was very helpful and accommodating.",
      verified: true,
      avatar: "MR",
    },
  ];

  const isAvailable = room.status === "available" || room.available === true;

  // Min checkout date = day after checkin
  const minCheckOut = checkInDate
    ? addDays(checkInDate, 1).toISOString().slice(0, 10)
    : todayInput();

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white/80 hover:text-white transition z-10"
            onClick={() => setLightboxOpen(false)}
          >
            <X className="w-7 h-7 sm:w-8 sm:h-8" />
          </button>
          <Image
            src={room.images[selectedImageIndex]}
            alt={room.type}
            width={1200}
            height={800}
            className="max-w-full max-h-[85vh] sm:max-h-[90vh] object-contain rounded-lg"
          />
        </div>
      )}

      {/* Top Bar */}
      

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-7xl">
        {/* Breadcrumb & Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/rooms" className="hover:text-foreground transition-colors">
              Rooms
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground font-medium truncate max-w-[120px] sm:max-w-none">{room.type}</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3 sm:gap-4">
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <Badge className="bg-amber-500 hover:bg-amber-600 text-white font-medium px-2 py-0.5 text-xs sm:text-sm">
                  Room {room.roomNumber}
                </Badge>
                <Badge variant="secondary" className="font-medium text-xs sm:text-sm">
                  {room.view}
                </Badge>
                <Badge variant="outline" className="font-medium text-xs sm:text-sm">
                  Floor {room.floor}
                </Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-tight">
                {room.type}
              </h1>
              <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1 text-muted-foreground text-xs sm:text-sm">
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-foreground">{room.rating}</span>
                  <span>({room.reviews} reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Prime Location, Mombasa, Majengo</span>
                </div>
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" />
                  <span className="text-green-700 font-medium">Verified</span>
                </div>
              </div>
            </div>

            <div className="text-left lg:text-right">
              <div className="flex items-center gap-2 sm:gap-3 lg:justify-end">
                {room.originalPrice > room.price && (
                  <span className="text-base sm:text-lg text-muted-foreground line-through decoration-red-400">
                    {formatKES(room.originalPrice)}
                  </span>
                )}
                <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
                  {formatKES(room.price)}
                </span>
              </div>
              <p className="text-muted-foreground text-xs sm:text-sm mt-1">per night, excluding taxes</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Main Content - 8 cols */}
          <div className="lg:col-span-8 space-y-6 sm:space-y-8">
            {/* Image Gallery */}
            <div className="space-y-2 sm:space-y-3">
              <div
                className="relative aspect-[4/3] sm:aspect-[16/10] md:aspect-[16/9] rounded-xl sm:rounded-2xl overflow-hidden bg-neutral-200 group cursor-zoom-in"
                onClick={() => setLightboxOpen(true)}
              >
                <Image
                  src={room.images[selectedImageIndex]}
                  alt={`${room.type} - View ${selectedImageIndex + 1}`}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                  sizes="(max-width: 1024px) 100vw, 66vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4">
                  <Badge className="bg-black/60 text-white border-0 backdrop-blur-md font-medium text-xs">
                    {selectedImageIndex + 1} / {room.images.length}
                  </Badge>
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium border border-white/30">
                    Click to expand
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 sm:gap-2 md:gap-3">
                {room.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={cn(
                      "relative aspect-[4/3] rounded-lg sm:rounded-xl overflow-hidden border-2 transition-all duration-300",
                      selectedImageIndex === index
                        ? "border-amber-500 ring-2 ring-amber-500/20"
                        : "border-transparent hover:border-neutral-300 opacity-70 hover:opacity-100"
                    )}
                  >
                    <Image
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="150px"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Info Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
              {[
                { icon: Maximize, label: "Size", value: room.size },
                { icon: Users, label: "Capacity", value: `${room.capacity} guests` },
                { icon: Bed, label: "Beds", value: room.beds },
                { icon: Wifi, label: "Internet", value: "Free WiFi" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl bg-white border border-neutral-100 shadow-sm"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] sm:text-xs text-muted-foreground">{item.label}</p>
                    <p className="font-semibold text-xs sm:text-sm truncate">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Tabs Section */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="w-full flex bg-white border border-neutral-200 p-1 rounded-xl h-auto overflow-x-auto scrollbar-hide">
                {["overview", "amenities", "policies", "reviews"].map((tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="flex-1 rounded-lg capitalize text-xs sm:text-sm font-medium data-[state=active]:bg-amber-500 data-[state=active]:text-white transition-all py-2 sm:py-2.5 whitespace-nowrap px-3 sm:px-4"
                  >
                    {tab}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Overview */}
              <TabsContent value="overview" className="mt-4 sm:mt-6 space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-neutral-100 shadow-sm">
                  <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">About this room</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                    {room.description}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-neutral-100 shadow-sm">
                    <h4 className="font-semibold mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                      <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                      Key Features
                    </h4>
                    <div className="space-y-2.5 sm:space-y-3">
                      {(room.features || []).slice(0, 6).map((feature, index) => (
                        <div key={index} className="flex items-center gap-2.5 sm:gap-3 text-xs sm:text-sm">
                          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                            <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-600" />
                          </div>
                          <span className="text-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-neutral-100 shadow-sm">
                    <h4 className="font-semibold mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                      House Rules
                    </h4>
                    <div className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm text-muted-foreground">
                      <div className="flex items-start gap-2.5 sm:gap-3">
                        <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Check-in from 2:00 PM</span>
                      </div>
                      <div className="flex items-start gap-2.5 sm:gap-3">
                        <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Check-out until 11:00 AM</span>
                      </div>
                      <div className="flex items-start gap-2.5 sm:gap-3">
                        <Ban className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400 mt-0.5 flex-shrink-0" />
                        <span>No smoking inside the room</span>
                      </div>
                      <div className="flex items-start gap-2.5 sm:gap-3">
                        <Ban className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400 mt-0.5 flex-shrink-0" />
                        <span>No parties or events</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Amenities */}
              <TabsContent value="amenities" className="mt-4 sm:mt-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-neutral-100 shadow-sm">
                  <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Room Amenities</h3>
                  <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                    {(room.amenities || []).map((amenity, index) => {
                      const IconComponent = getAmenityIcon(amenity.icon);
                      return (
                        <div
                          key={index}
                          className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border border-neutral-100 hover:border-amber-200 hover:bg-amber-50/30 transition-all duration-300 group"
                        >
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/30 transition-shadow">
                            <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-semibold mb-0.5 sm:mb-1 text-sm sm:text-base">{amenity.label}</h4>
                            <p className="text-xs sm:text-sm text-muted-foreground leading-snug">
                              {amenity.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <Separator className="my-6 sm:my-8" />

                  <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">All Features</h4>
                  <div className="grid sm:grid-cols-2 gap-2 sm:gap-3">
                    {(room.features || []).map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm p-2 rounded-lg hover:bg-neutral-50 transition-colors">
                        <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Policies */}
              <TabsContent value="policies" className="mt-4 sm:mt-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                  <Card className="border-neutral-100 shadow-sm overflow-hidden">
                    <CardContent className="p-4 sm:p-6">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                        <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                      </div>
                      <h4 className="font-semibold mb-3 sm:mb-4 text-base sm:text-lg">Check-in & Check-out</h4>
                      <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                        <div className="flex justify-between items-center p-2.5 sm:p-3 bg-neutral-50 rounded-lg">
                          <span className="text-muted-foreground">Check-in time</span>
                          <span className="font-medium">2:00 PM - 12:00 AM</span>
                        </div>
                        <div className="flex justify-between items-center p-2.5 sm:p-3 bg-neutral-50 rounded-lg">
                          <span className="text-muted-foreground">Check-out time</span>
                          <span className="font-medium">Before 11:00 AM</span>
                        </div>
                        <div className="flex justify-between items-center p-2.5 sm:p-3 bg-neutral-50 rounded-lg">
                          <span className="text-muted-foreground">Express check-in</span>
                          <span className="font-medium text-green-600">Available</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-neutral-100 shadow-sm overflow-hidden">
                    <CardContent className="p-4 sm:p-6">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                        <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
                      </div>
                      <h4 className="font-semibold mb-3 sm:mb-4 text-base sm:text-lg">Cancellation Policy</h4>
                      <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                        <div className="flex justify-between items-center p-2.5 sm:p-3 bg-neutral-50 rounded-lg">
                          <span className="text-muted-foreground">Free cancellation</span>
                          <span className="font-medium text-green-600">Up to 24h before</span>
                        </div>
                        <div className="flex justify-between items-center p-2.5 sm:p-3 bg-neutral-50 rounded-lg">
                          <span className="text-muted-foreground">Non-refundable</span>
                          <span className="font-medium">After check-in</span>
                        </div>
                        <div className="flex justify-between items-center p-2.5 sm:p-3 bg-neutral-50 rounded-lg">
                          <span className="text-muted-foreground">Modification fee</span>
                          <span className="font-medium">KES 500</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-neutral-100 shadow-sm overflow-hidden md:col-span-2">
                    <CardContent className="p-4 sm:p-6">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-50 rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                        <Ban className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
                      </div>
                      <h4 className="font-semibold mb-3 sm:mb-4 text-base sm:text-lg">Important Notes</h4>
                      <div className="grid sm:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
                        <div className="p-3 sm:p-4 bg-neutral-50 rounded-xl">
                          <p className="font-medium mb-1">Smoking</p>
                          <p className="text-muted-foreground">Strictly prohibited. Penalty applies.</p>
                        </div>
                        <div className="p-3 sm:p-4 bg-neutral-50 rounded-xl">
                          <p className="font-medium mb-1">Pets</p>
                          <p className="text-muted-foreground">Not allowed in this room category.</p>
                        </div>
                        <div className="p-3 sm:p-4 bg-neutral-50 rounded-xl">
                          <p className="font-medium mb-1">Damage</p>
                          <p className="text-muted-foreground">Guests liable for any damages caused.</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Reviews */}
              <TabsContent value="reviews" className="mt-4 sm:mt-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-neutral-100 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold">Guest Reviews</h3>
                      <p className="text-muted-foreground text-xs sm:text-sm mt-1">Based on verified stays</p>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 bg-amber-50 px-3 sm:px-4 py-2 rounded-xl border border-amber-100 w-fit">
                      <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-400 text-amber-400" />
                      <div>
                        <span className="font-bold text-base sm:text-lg">{room.rating}</span>
                        <span className="text-muted-foreground text-xs sm:text-sm ml-1">/ 5 ({room.reviews} reviews)</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    {reviews.map((review, index) => (
                      <div
                        key={index}
                        className="p-3 sm:p-5 rounded-xl border border-neutral-100 hover:border-amber-200 transition-all duration-300"
                      >
                        <div className="flex items-start justify-between mb-2.5 sm:mb-3">
                          <div className="flex items-center gap-2.5 sm:gap-3">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 border border-amber-200 flex items-center justify-center font-semibold text-amber-700 text-xs sm:text-sm flex-shrink-0">
                              {review.avatar}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                <span className="font-semibold text-sm sm:text-base">{review.name}</span>
                                {review.verified && (
                                  <Badge variant="secondary" className="text-[10px] sm:text-xs font-medium bg-green-50 text-green-700 hover:bg-green-50 border-green-200 px-1.5 py-0">
                                    <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5" />
                                    Verified
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={cn(
                                        "w-3 h-3 sm:w-3.5 sm:h-3.5",
                                        i < review.rating
                                          ? "fill-amber-400 text-amber-400"
                                          : "fill-neutral-200 text-neutral-200"
                                      )}
                                    />
                                  ))}
                                </div>
                                <span className="text-[11px] sm:text-xs text-muted-foreground">{review.date}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed pl-11 sm:pl-[52px]">
                          {review.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar - 4 cols */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-24 space-y-4 sm:space-y-6">
              {/* Booking Card */}
              <Card className="border-neutral-100 shadow-xl shadow-neutral-200/50 overflow-hidden">
                <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-4 sm:p-6 text-white">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <p className="text-amber-100 text-xs sm:text-sm font-medium mb-1">Starting from</p>
                      <div className="flex items-baseline gap-1.5 sm:gap-2">
                        <span className="text-2xl sm:text-3xl font-bold">{formatKES(room.price)}</span>
                        <span className="text-amber-100 text-xs sm:text-sm">/ night</span>
                      </div>
                    </div>
                    <Badge className={cn(
                      "text-white border-0 font-semibold text-[10px] sm:text-xs",
                      isAvailable ? "bg-green-400/30 backdrop-blur-sm" : "bg-red-400/30 backdrop-blur-sm"
                    )}>
                      {isAvailable ? "Available" : "Booked"}
                    </Badge>
                  </div>
                  {room.originalPrice > room.price && (
                    <div className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-amber-100">
                      <span className="line-through">{formatKES(room.originalPrice)}</span>
                      <span className="ml-1.5 sm:ml-2 font-medium">Save {Math.round((1 - room.price / room.originalPrice) * 100)}%</span>
                    </div>
                  )}
                </div>

                <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-5">
                  {isAvailable ? (
                    <>
                      {/* Dates - Native date inputs */}
                      <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        <div className="space-y-1 sm:space-y-1.5">
                          <label className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Check-in
                          </label>
                          <div className="relative">
                            <CalendarIcon className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 pointer-events-none" />
                            <Input
                              type="date"
                              value={toInputDate(checkInDate)}
                              min={todayInput()}
                              onChange={handleCheckIn}
                              className="h-10 sm:h-11 pl-8 sm:pl-10 rounded-xl border-neutral-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-xs sm:text-sm"
                            />
                          </div>
                        </div>

                        <div className="space-y-1 sm:space-y-1.5">
                          <label className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Check-out
                          </label>
                          <div className="relative">
                            <CalendarIcon className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 pointer-events-none" />
                            <Input
                              type="date"
                              value={toInputDate(checkOutDate)}
                              min={minCheckOut}
                              onChange={handleCheckOut}
                              disabled={!checkInDate}
                              className="h-10 sm:h-11 pl-8 sm:pl-10 rounded-xl border-neutral-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Guests */}
                      <div className="space-y-1 sm:space-y-1.5">
                        <label className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">Guests</label>
                        <div className="relative">
                          <Users className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
                          <select
                            value={guests}
                            onChange={(e) => setGuests(Number(e.target.value))}
                            className="w-full h-10 sm:h-11 pl-8 sm:pl-10 pr-4 rounded-xl border border-neutral-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all appearance-none cursor-pointer"
                          >
                            {[...Array(room.capacity || 4)].map((_, i) => (
                              <option key={i + 1} value={i + 1}>
                                {i + 1} Guest{i > 0 ? "s" : ""}
                              </option>
                            ))}
                          </select>
                          <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground rotate-90 pointer-events-none" />
                        </div>
                      </div>

                      {/* Price Breakdown */}
                      {nights > 0 && (
                        <div className="space-y-2 sm:space-y-3 pt-1 sm:pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                            <div className="flex justify-between text-muted-foreground">
                              <span>{formatKES(room.price)} × {nights} nights</span>
                              <span className="text-foreground">{formatKES(subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                Service fee
                              </span>
                              <span className="text-foreground">{formatKES(serviceFee)}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <CreditCard className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                Taxes (16%)
                              </span>
                              <span className="text-foreground">{formatKES(taxes)}</span>
                            </div>
                          </div>
                          <Separator />
                          <div className="flex justify-between font-bold text-sm sm:text-base">
                            <span>Total</span>
                            <span>{formatKES(totalPrice)}</span>
                          </div>
                        </div>
                      )}

                      <Button
                        className="w-full h-11 sm:h-12 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all text-sm sm:text-base"
                        size="lg"
                        disabled={!checkInDate || !checkOutDate}
                        asChild
                      >
                        <Link
                          href={checkInDate && checkOutDate
                            ? `/booking?room=${room._id || room.id}&checkin=${checkInDate.toISOString()}&checkout=${checkOutDate.toISOString()}&guests=${guests}`
                            : "#"
                          }
                        >
                          {checkInDate && checkOutDate ? "Reserve Now" : "Select Dates"}
                        </Link>
                      </Button>

                      <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground">
                        <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-500" />
                        <span>Free cancellation up to 24 hours before arrival</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center space-y-3 sm:space-y-4 py-3 sm:py-4">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                        <CalendarIcon className="w-7 h-7 sm:w-8 sm:h-8 text-red-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm sm:text-base">Currently Unavailable</p>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">This room is booked for the selected dates</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-1 sm:pt-2">
                        <Button variant="outline" className="rounded-xl h-10 sm:h-11 text-xs sm:text-sm" asChild>
                          <Link href="/rooms">Other Rooms</Link>
                        </Button>
                        <Button
                          className="rounded-xl h-10 sm:h-11 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-xs sm:text-sm"
                          asChild
                        >
                          <Link href={`/booking?room=${room._id || room.id}&waitlist=true`}>Join Waitlist</Link>
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Contact Support */}
              <Card className="border-neutral-100 shadow-sm overflow-hidden">
                <CardContent className="p-4 sm:p-6">
                  <h3 className="font-semibold mb-0.5 sm:mb-1 text-sm sm:text-base">Need Help?</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">Our team is available 24/7</p>
                  <div className="space-y-2 sm:space-y-3">
                    <a
                      href="tel:+254713706034"
                      className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl bg-neutral-50 hover:bg-amber-50 hover:border-amber-200 border border-transparent transition-all group"
                    >
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white border border-neutral-200 flex items-center justify-center group-hover:border-amber-200 transition-colors flex-shrink-0">
                        <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600" />
                      </div>
                      <div className="text-xs sm:text-sm min-w-0">
                        <p className="font-medium truncate">+254 713706034</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">Call us anytime</p>
                      </div>
                    </a>
                    <a
                      href="mailto:reservations@luxuryhaven.com"
                      className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl bg-neutral-50 hover:bg-amber-50 hover:border-amber-200 border border-transparent transition-all group"
                    >
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white border border-neutral-200 flex items-center justify-center group-hover:border-amber-200 transition-colors flex-shrink-0">
                        <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600" />
                      </div>
                      <div className="text-xs sm:text-sm min-w-0">
                        <p className="font-medium truncate">reservations@luxuryhaven.com</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">Email response in 2h</p>
                      </div>
                    </a>
                  </div>
                </CardContent>
              </Card>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {[
                  { icon: ShieldCheck, label: "Secure" },
                  { icon: Zap, label: "Instant" },
                  { icon: Heart, label: "Trusted" },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5 sm:gap-2 p-2.5 sm:p-3 rounded-xl bg-white border border-neutral-100 text-center">
                    <item.icon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                    <span className="text-[10px] sm:text-xs font-medium text-muted-foreground">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}