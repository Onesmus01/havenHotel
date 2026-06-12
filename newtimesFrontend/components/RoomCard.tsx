"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Star,
  MapPin,
  ArrowRight,
  Heart,
  Users,
  Maximize,
  ChevronDown,
  CalendarDays,
  BadgeCheck,
  Wrench,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080/api";

function ratingLabel(score) {
  if (score >= 9) return "Excellent";
  if (score >= 8) return "Very Good";
  if (score >= 7) return "Good";
  if (score >= 6) return "Pleasant";
  return "Fair";
}

function getDiscountPct(original, current) {
  if (!original || original <= current) return 0;
  return Math.round(((original - current) / original) * 100);
}

function getStatusConfig(status) {
  switch (status) {
    case "available":
      return {
        bg: "bg-emerald-600",
        icon: BadgeCheck,
        label: "Available",
      };
    case "booked":
      return {
        bg: "bg-stone-700",
        icon: null,
        label: "Booked",
      };
    case "maintenance":
      return {
        bg: "bg-amber-600",
        icon: Wrench,
        label: "Maintenance",
      };
    default:
      return {
        bg: "bg-stone-500",
        icon: null,
        label: status,
      };
  }
}

/* ─── Sky Background Component ─── */
function SkyBackground() {
  const [stars, setStars] = useState([]);

  useEffect(() => {
    const generated = [];
    for (let i = 0; i < 120; i++) {
      generated.push({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 2.5 + 0.5,
        delay: Math.random() * 5,
        duration: Math.random() * 3 + 2,
        opacity: Math.random() * 0.7 + 0.3,
      });
    }
    setStars(generated);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Deep night sky gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, 
            #050714 0%, 
            #0a0d24 25%, 
            #111530 50%, 
            #0a0d24 75%, 
            #050714 100%)`,
        }}
      />

      {/* Subtle nebula clouds */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(ellipse at 20% 30%, rgba(100, 80, 180, 0.4) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 70%, rgba(80, 120, 200, 0.3) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(60, 100, 160, 0.2) 0%, transparent 60%)`,
        }}
      />

      {/* Twinkling stars */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            animation: `twinkle ${star.duration}s ease-in-out ${star.delay}s infinite alternate`,
            boxShadow: `0 0 ${star.size * 2}px rgba(255,255,255,0.5)`,
          }}
        />
      ))}

      {/* Shooting star */}
      <div
        className="absolute h-px w-24 bg-gradient-to-r from-transparent via-white to-transparent"
        style={{
          top: '15%',
          left: '-10%',
          animation: 'shootingStar 8s linear 3s infinite',
          opacity: 0.6,
        }}
      />
      <div
        className="absolute h-px w-16 bg-gradient-to-r from-transparent via-white to-transparent"
        style={{
          top: '40%',
          left: '-10%',
          animation: 'shootingStar 12s linear 7s infinite',
          opacity: 0.4,
        }}
      />

      {/* Moon glow */}
      <div
        className="absolute rounded-full"
        style={{
          top: '8%',
          right: '12%',
          width: '80px',
          height: '80px',
          background: 'radial-gradient(circle, rgba(255,250,220,0.9) 0%, rgba(255,250,220,0.3) 40%, transparent 70%)',
          boxShadow: '0 0 60px 20px rgba(255,250,220,0.15), 0 0 120px 40px rgba(255,250,220,0.05)',
        }}
      />

      {/* CSS keyframes via style tag */}
      <style jsx>{`
        @keyframes twinkle {
          0% { opacity: 0.2; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes shootingStar {
          0% { transform: translateX(0) translateY(0) rotate(-15deg); opacity: 0; }
          10% { opacity: 1; }
          20% { transform: translateX(120vw) translateY(30vh) rotate(-15deg); opacity: 0; }
          100% { transform: translateX(120vw) translateY(30vh) rotate(-15deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function RoomCard({ room, idx, isFav, toggleFav, isLastRow }) {
  const image =
    room.images[0] ||
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80";
  const discount = getDiscountPct(room.originalPrice, room.price);
  const statusConfig = getStatusConfig(room.status);

  const router = useRouter();

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.4, delay: Math.min(idx * 0.05, 0.3), ease: "easeOut" }}
      className={`group relative flex h-full flex-col overflow-hidden border border-stone-200 bg-white shadow-md transition-shadow duration-300 hover:shadow-lg hover:border-stone-300 ${isLastRow ? 'rounded-t-xl' : 'rounded-xl'}`}
    >
      {/* Status Badge */}
      <div className={`absolute top-2 left-2 z-10 flex items-center gap-1 rounded px-2 py-1 text-[10px] font-semibold text-white shadow-md ${statusConfig.bg}`}>
        {statusConfig.icon && <statusConfig.icon className="h-3 w-3" />}
        {statusConfig.label}
      </div>

      {/* Discount Badge */}
      {discount > 0 && (
        <div className="absolute top-2 right-2 z-10 rounded bg-rose-500 px-2 py-1 text-[10px] font-semibold text-white shadow-md">
          {discount}% off
        </div>
      )}

      {/* Image — replaced with img tag, object-fill fills the frame */}
      <div className="relative h-56 shrink-0 overflow-hidden bg-stone-100">
        <img
          src={image}
          alt={room.type}
          className="h-full w-full object-fill object-center transition-transform duration-500 group-hover:scale-105"
        />

        {/* Favorite */}
        <button
          onClick={() => toggleFav(room._id)}
          className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-colors hover:bg-white"
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              isFav ? "fill-rose-500 text-rose-500" : "text-stone-600"
            }`}
          />
        </button>

        {/* Bottom meta */}
        <div className="absolute bottom-2 left-2 flex gap-1">
          <span className="flex items-center gap-1 rounded bg-white/90 px-2 py-1 text-[10px] font-medium text-stone-700 backdrop-blur-sm">
            <Maximize className="h-3 w-3" />
            {room.size}
          </span>
          <span className="flex items-center gap-1 rounded bg-white/90 px-2 py-1 text-[10px] font-medium text-stone-700 backdrop-blur-sm">
            <Users className="h-3 w-3" />
            {room.capacity}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between p-4">
        {/* Title & Rating */}
        <div className="flex items-center justify-between mb-1">
          <h3 className="truncate text-base font-bold text-stone-800">
            {room.type}
          </h3>
          <div className="flex items-center gap-1 text-amber-500">
            <Star className="h-4 w-4 fill-amber-500" />
            <span className="text-sm font-medium">{room.rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Room info */}
        <p className="text-xs text-stone-400 mb-1">
          Room {room.roomNumber} · {room.floor}
        </p>

        {/* Location */}
        <div className="flex items-center gap-1 text-sm text-blue-600 mb-2">
          <MapPin className="h-3.5 w-3.5" />
          <span className="truncate">{room.view} · Majengo</span>
        </div>

        {/* Date + Cancellation */}
        <div className="flex items-center gap-3 text-xs text-stone-500 mb-2">
          <span className="flex items-center gap-1">
            <CalendarDays className="h-3 w-3" />
            Jul 1 — Jul 3
          </span>
          <span className="flex items-center gap-1 font-medium text-emerald-700">
            <BadgeCheck className="h-3 w-3" />
            Free cancellation
          </span>
        </div>

        {/* Price & CTA */}
        <div className="flex items-center justify-between pt-2 border-t border-stone-100">
          <div>
            {room.originalPrice > room.price && (
              <p className="text-xs text-stone-400 line-through">
                ksh {room.originalPrice.toLocaleString()}
              </p>
            )}
            <p className="text-lg font-semibold text-stone-800">
              ksh {room.price.toLocaleString()}
              <span className="text-xs font-normal text-stone-500">/night</span>
            </p>
          </div>
          <button onClick={()=>router.push(`/rooms/${room._id}`)} className="flex items-center gap-1 rounded-lg bg-stone-900 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-stone-800">
            See more
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </motion.article>
  );
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("recommended");
  const [favorites, setFavorites] = useState(new Set());

  const fetchRooms = useCallback(async () => {
    try {
      const res = await fetch(`${backendUrl}/room/get-rooms`);
      const data = await res.json();
      if (data.success) {
        const normalized = (data.data || []).map((r) => ({
          ...r,
          _id: r._id || r.id,
          rating: r.rating || 7.7,
          reviews: r.reviews || 0,
          features: r.features || [],
          amenities: r.amenities || [],
          images: r.images || [],
        }));
        setRooms(normalized);
      }
    } catch (err) {
      console.error("Failed to fetch rooms:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // Auto-refresh every 30 seconds to catch status changes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchRooms();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchRooms]);

  const filtered = rooms.filter((r) => {
    if (filter === "all") return true;
    if (filter === "available") return r.status === "available";
    if (filter === "ocean")
      return (
        r.view?.toLowerCase().includes("ocean") ||
        r.view?.toLowerCase().includes("sea")
      );
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "price-low") return a.price - b.price;
    if (sort === "price-high") return b.price - a.price;
    if (sort === "rating") return b.rating - a.rating;
    return 0;
  });

  const toggleFav = (id) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <section id="rooms" className="relative py-8 lg:py-12">
      {/* Sky Background */}
      <SkyBackground />

      {/* Content overlay */}
      <div className="relative z-10 mx-auto max-w-[1920px] px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-5 lg:mb-6"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-0.5 text-[11px] font-medium uppercase tracking-[0.2em] text-stone-300">
                {rooms.length} properties found
              </p>
              <h2 className="font-serif text-2xl font-light italic text-white lg:text-3xl">
                Rooms & Suites
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={fetchRooms}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-stone-300 backdrop-blur-sm transition-colors hover:bg-white/20 hover:text-white"
                title="Refresh rooms"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
              <div className="flex overflow-hidden rounded-full border border-white/20 bg-white/10 p-0.5 backdrop-blur-sm">
                {[
                  { key: "all", label: "All" },
                  { key: "available", label: "Available" },
                  { key: "ocean", label: "Ocean View" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key)}
                    className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${
                      filter === tab.key
                        ? "bg-white/90 text-stone-900"
                        : "text-stone-300 hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="appearance-none rounded-full border border-white/20 bg-white/10 py-1.5 pl-3 pr-8 text-[11px] font-medium text-stone-300 outline-none backdrop-blur-sm focus:border-white/40"
                >
                  <option value="recommended" className="text-stone-800">Recommended</option>
                  <option value="price-low" className="text-stone-800">Price: Low to High</option>
                  <option value="price-high" className="text-stone-800">Price: High to Low</option>
                  <option value="rating" className="text-stone-800">Top Rated</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-stone-400" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Loading */}
        {loading && (
          <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-80 animate-pulse rounded-xl bg-white/10 backdrop-blur-sm"
              />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && sorted.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-sm text-stone-300">No rooms match your filters.</p>
          </div>
        )}

        {/* Grid — no AnimatePresence, no layout, completely static after mount */}
        <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {sorted.map((room, idx) => {
            const totalItems = sorted.length;
            const isLastRow = idx >= totalItems - 4;
            return (
              <RoomCard
                key={room._id}
                room={room}
                idx={idx}
                isFav={favorites.has(room._id)}
                toggleFav={toggleFav}
                isLastRow={isLastRow}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}