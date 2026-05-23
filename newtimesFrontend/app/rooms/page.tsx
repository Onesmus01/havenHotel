"use client";

import { useState, useEffect, useMemo, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Star,
  Users,
  Bed,
  Search,
  Filter,
  MapPin,
  Ruler,
  ArrowRight,
  RotateCcw,
  Gem,
  Crown,
  Home,
  Sparkles,
  Mail,
  Menu,
  X,
  CalendarCheck,
  ChevronDown,
  SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Context } from "@/context/userContext.js";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080/api";

function formatKES(amount) {
  if (!amount && amount !== 0) return "KES 0";
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedView, setSelectedView] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [sortBy, setSortBy] = useState("price-low");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  const { user } = useContext(Context);

  useEffect(() => {
    setIsVisible(true);
    const fetchRooms = async () => {
      try {
        const res = await fetch(`${backendUrl}/room/get-rooms`);
        const data = await res.json();
        if (data.success) {
          const normalizedRooms = (data.data || []).map((room) => ({
            ...room,
            _id: room._id || room.id,
          }));
          setRooms(normalizedRooms);
        }
      } catch (err) {
        console.error("Failed to fetch rooms:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  const roomTypes = useMemo(() => ["all", ...new Set(rooms.map((r) => r.type || ""))], [rooms]);
  const viewTypes = useMemo(() => ["all", ...new Set(rooms.map((r) => r.view || ""))], [rooms]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchTerm) count++;
    if (selectedType !== "all") count++;
    if (selectedView !== "all") count++;
    if (priceRange[0] > 0 || priceRange[1] < 10000) count++;
    return count;
  }, [searchTerm, selectedType, selectedView, priceRange]);

  const filteredAndSortedRooms = useMemo(() => {
    const filtered = rooms.filter((room) => {
      const matchesSearch =
        (room.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          room.view?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          room.roomNumber?.toString().includes(searchTerm)) ?? false;

      const matchesType = selectedType === "all" || room.type === selectedType;
      const matchesView = selectedView === "all" || room.view === selectedView;
      const matchesPrice = room.price >= priceRange[0] && room.price <= priceRange[1];

      return matchesSearch && matchesType && matchesView && matchesPrice;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return (a.price || 0) - (b.price || 0);
        case "price-high":
          return (b.price || 0) - (a.price || 0);
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        case "size":
          return parseInt(b.size || 0) - parseInt(a.size || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [rooms, searchTerm, selectedType, selectedView, priceRange, sortBy]);

  const getRoomImage = (room) =>
    room.images && room.images.length > 0
      ? room.images[0]
      : "https://via.placeholder.com/600x400?text=No+Image";

  const getStatusStyle = (status) => {
    switch (status) {
      case "available":
        return "bg-emerald-500";
      case "booked":
        return "bg-rose-500";
      case "maintenance":
        return "bg-amber-500";
      default:
        return "bg-gray-500";
    }
  };

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/rooms", label: "Rooms", icon: Bed },
    { href: "/amenities", label: "Amenities", icon: Sparkles },
    { href: "/contact", label: "Contact", icon: Mail },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 relative overflow-hidden font-sans">
      {/* Soft ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-amber-100/40 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-40 w-[400px] h-[400px] bg-orange-100/30 rounded-full blur-3xl" />
      </div>

      {/* Navigation */}
      
      {/* Mobile Drawer */}
      <div className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity lg:hidden ${mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`} onClick={() => setMobileMenuOpen(false)} />
      <div className={`fixed top-0 right-0 bottom-0 w-[280px] bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 lg:hidden ${mobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <span className="font-bold text-gray-900">Menu</span>
          <button onClick={() => setMobileMenuOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${link.href === "/rooms" ? "bg-amber-50 text-amber-700" : "text-gray-700 hover:bg-gray-50"}`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Hero */}
      <section className="relative pt-24 pb-6 sm:pt-28 sm:pb-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50" />
        <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className={`text-center mb-6 sm:mb-8 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-12 bg-amber-300" />
              <Gem className="text-amber-500 w-4 h-4" />
              <div className="h-px w-12 bg-amber-300" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-2">Our Luxury Rooms</h1>
            <p className="text-sm sm:text-base text-gray-500 max-w-xl mx-auto">Premium accommodations with stunning views and world-class amenities</p>
          </div>

          {/* Mobile Filter Toggle */}
          <div className="md:hidden mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full flex items-center justify-between bg-white border border-neutral-200 rounded-xl px-4 py-3 shadow-sm active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-amber-600" />
                <span className="font-semibold text-sm text-gray-800">Filters & Search</span>
                {activeFilterCount > 0 && (
                  <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{activeFilterCount}</span>
                )}
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </button>
          </div>

          {/* Filter Panel */}
          <div className={`transition-all duration-500 overflow-hidden ${showFilters ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"} md:max-h-none md:opacity-100`}>
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl p-4 sm:p-6 border border-neutral-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
                <div className="lg:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Room, view, number..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 h-10 rounded-xl bg-gray-50 border-gray-200 text-sm focus-visible:ring-amber-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Type</label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="h-10 rounded-xl bg-gray-50 border-gray-200">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {roomTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type === "all" ? "All Types" : type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">View</label>
                  <Select value={selectedView} onValueChange={setSelectedView}>
                    <SelectTrigger className="h-10 rounded-xl bg-gray-50 border-gray-200">
                      <SelectValue placeholder="All Views" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {viewTypes.map((view) => (
                        <SelectItem key={view} value={view}>{view === "all" ? "All Views" : view}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Sort</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="h-10 rounded-xl bg-gray-50 border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="price-low">Price: Low → High</SelectItem>
                      <SelectItem value="price-high">Price: High → Low</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="size">Largest First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-semibold text-gray-600">Price Range</label>
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                    {formatKES(priceRange[0])} - {formatKES(priceRange[1])}
                  </span>
                </div>
                <Slider value={priceRange} onValueChange={setPriceRange} max={10000} min={0} step={100} className="w-full" />
                <div className="flex justify-between mt-1 text-[10px] text-gray-400">
                  <span>{formatKES(0)}</span>
                  <span>{formatKES(10000)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rooms Grid */}
      <section className="pb-12 sm:pb-16 relative z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          {/* Results bar */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-sm sm:text-lg font-semibold text-gray-900">
              <span className="text-amber-600">{filteredAndSortedRooms.length}</span> rooms found
            </h2>
            {activeFilterCount > 0 && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedType("all");
                  setSelectedView("all");
                  setPriceRange([0, 10000]);
                }}
                className="text-xs sm:text-sm text-gray-500 hover:text-amber-600 flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>

          {/* Grid - 2 cols on ALL mobile, 3 on md+ */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-28 sm:h-56 w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4 lg:gap-6">
              {filteredAndSortedRooms.map((room, index) => (
                <Card
                  key={room._id}
                  className="overflow-hidden rounded-xl sm:rounded-2xl border-0 shadow-md hover:shadow-xl bg-white group transition-all duration-500 hover:-translate-y-1"
                  style={{
                    animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`,
                  }}
                >
                  {/* Image */}
                  <div className="relative h-28 sm:h-48 lg:h-56 overflow-hidden">
                    <Image
                      src={getRoomImage(room)}
                      alt={room.type}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      sizes="(max-width: 768px) 50vw, 33vw"
                    />
                    {/* Status - compact on mobile */}
                    <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
                      <span className={`inline-flex items-center gap-1 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md text-[9px] sm:text-xs font-bold text-white ${getStatusStyle(room.status)} shadow-lg`}>
                        <span className={`w-1 h-1 rounded-full bg-white ${room.status === "available" ? "animate-pulse" : ""}`} />
                        <span className="hidden sm:inline">{room.status?.charAt(0).toUpperCase() + room.status?.slice(1)}</span>
                        <span className="sm:hidden">{room.status === "available" ? "Open" : room.status === "booked" ? "Full" : "Fix"}</span>
                      </span>
                    </div>
                    {/* Price */}
                    <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                      <div className="bg-black/50 backdrop-blur-md text-white px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-lg text-[9px] sm:text-xs font-bold">
                        {formatKES(room.price || 0)}
                        <span className="opacity-70 font-normal hidden sm:inline">/nt</span>
                      </div>
                    </div>
                    {/* Room number */}
                    <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3">
                      <span className="bg-black/40 backdrop-blur-sm text-white px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-xs font-semibold">
                        #{room.roomNumber || "N/A"}
                      </span>
                    </div>
                  </div>

                  <CardContent className="p-2 sm:p-4 lg:p-5">
                    {/* Title & Rating */}
                    <div className="flex items-start justify-between gap-1 mb-0.5 sm:mb-2">
                      <h3 className="text-[11px] sm:text-lg font-bold text-gray-900 leading-tight truncate flex-1">
                        {room.type || "Room"}
                      </h3>
                      <div className="flex items-center gap-0.5 bg-amber-50 px-1 sm:px-1.5 py-0.5 rounded flex-shrink-0">
                        <Star className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-[9px] sm:text-xs font-bold text-amber-700">{room.rating || 0}</span>
                      </div>
                    </div>

                    {/* Location */}
                    <p className="text-[9px] sm:text-sm text-gray-500 mb-1.5 sm:mb-3 flex items-center gap-1 truncate">
                      <MapPin className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-amber-400 flex-shrink-0" />
                      <span className="truncate">{room.view || "Standard"} • Floor {room.floor || "-"}</span>
                    </p>

                    {/* Features - hidden on tiny, show on sm+ */}
                    <div className="hidden sm:flex flex-wrap gap-1 mb-3">
                      {room.features?.slice(0, 3).map((feature, idx) => (
                        <span key={idx} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          {feature}
                        </span>
                      ))}
                    </div>

                    {/* Specs - hidden on tiny */}
                    <div className="hidden sm:flex items-center gap-3 text-xs text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-amber-400" />
                        {room.capacity || 1}
                      </span>
                      <span className="flex items-center gap-1">
                        <Ruler className="w-3.5 h-3.5 text-amber-400" />
                        {room.size || "N/A"}
                      </span>
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-7 sm:h-9 text-[10px] sm:text-xs rounded-lg border-gray-200 hover:border-amber-400 hover:text-amber-600 bg-transparent px-0"
                        asChild
                      >
                        <Link href={`/rooms/${room._id}`}>Details</Link>
                      </Button>
                      <Button
                        size="sm"
                        className={`flex-1 h-7 sm:h-9 text-[10px] sm:text-xs rounded-lg font-semibold px-0 ${
                          room.status === "available"
                            ? "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-md"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        }`}
                        disabled={room.status !== "available"}
                        asChild={room.status === "available"}
                      >
                        {room.status === "available" ? (
                          <Link href={`/booking?room=${room._id}`} className="flex items-center justify-center gap-1">
                            <span className="hidden sm:inline">Book</span>
                            <span className="sm:hidden">Book</span>
                            <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          </Link>
                        ) : (
                          <span>Full</span>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredAndSortedRooms.length === 0 && (
            <div className="text-center py-16 sm:py-20 animate-in fade-in">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 sm:w-8 sm:h-8 text-amber-300" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">No rooms found</h3>
              <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">Try adjusting your filters or search terms to find available rooms.</p>
              <Button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedType("all");
                  setSelectedView("all");
                  setPriceRange([0, 10000]);
                }}
                className="rounded-full px-6 bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg hover:shadow-xl transition-all"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Inline animation keyframes */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}