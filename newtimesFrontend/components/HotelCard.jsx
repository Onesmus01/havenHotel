'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  FaStar, 
  FaMapMarkerAlt, 
  FaRegHeart, 
  FaHeart, 
  FaWifi, 
  FaSwimmingPool, 
  FaParking,
  FaCoffee,
  FaSnowflake,
  FaExpand,
  FaArrowRight
} from 'react-icons/fa';
import { MdVerified } from 'react-icons/md';

// ─── Mock Weather (fallback when no API key) ───────────
const MOCK_WEATHER = {
  temp: 24,
  condition: 'Clear',
  icon: '01d'
};

const WEATHER_API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY || '';

// ─── Component ─────────────────────────────────────────
const HotelCard = ({ room }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [weather, setWeather] = useState(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Guard clause
  if (!room || !room.id) return null;

  // ─── Weather Fetch ───────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const fetchWeather = async () => {
      if (!room.location) return;
      
      if (!WEATHER_API_KEY) {
        setTimeout(() => {
          if (!cancelled) setWeather(MOCK_WEATHER);
        }, 400);
        return;
      }

      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(room.location)}&units=metric&appid=${WEATHER_API_KEY}`
        );
        if (!res.ok) throw new Error('Weather API failed');
        const data = await res.json();
        
        if (!cancelled && data?.main) {
          setWeather({
            temp: Math.round(data.main.temp),
            condition: data.weather[0].main,
            icon: data.weather[0].icon
          });
        }
      } catch (err) {
        if (!cancelled) setWeather(MOCK_WEATHER);
      }
    };

    fetchWeather();
    return () => { cancelled = true; };
  }, [room.location]);

  // ─── Handlers (prevent Link navigation) ───────────────
  const handleLike = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(prev => !prev);
  }, []);

  const handleFav = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFav(prev => !prev);
  }, []);

  const handleShowMore = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMore(prev => !prev);
  }, []);

  const handleImageLoad = useCallback(() => setImgLoaded(true), []);
  const handleImageError = useCallback(() => {
    setImgError(true);
    setImgLoaded(true);
  }, []);

  // ─── Derived Values ──────────────────────────────────
  const discount = room.discount || 0;
  const originalPrice = discount > 0 
    ? Math.round(room.pricePerNight / (1 - discount / 100)) 
    : null;
  
  const amenities = room.amenities || ['wifi', 'parking'];
  const badge = room.badge || (discount > 0 ? `${discount}% OFF` : 'Exclusive');

  const amenityIcons = {
    wifi: <FaWifi className="w-3.5 h-3.5" />,
    pool: <FaSwimmingPool className="w-3.5 h-3.5" />,
    parking: <FaParking className="w-3.5 h-3.5" />,
    breakfast: <FaCoffee className="w-3.5 h-3.5" />,
    ac: <FaSnowflake className="w-3.5 h-3.5" />
  };

  // ─── Render ──────────────────────────────────────────
  return (
    <Link
      href={`/rooms/${room.id}`}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="group relative flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl 
                 transition-all duration-500 ease-out max-w-sm w-full border border-gray-100 
                 hover:border-blue-200 hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ═══ IMAGE SECTION ═══ */}
      <div className="relative w-full h-60 overflow-hidden bg-gray-100">
        {/* Skeleton Loader */}
        {!imgLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 
                          animate-pulse z-10" />
        )}

        {/* Next.js Image (Performance Optimized) */}
        <Image
          src={imgError ? 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop' : room.img}
          alt={room.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
          onLoad={handleImageLoad}
          onError={handleImageError}
          className={`object-cover transition-all duration-700 ease-out
                      ${imgLoaded ? 'opacity-100' : 'opacity-0'}
                      ${isHovered ? 'scale-110' : 'scale-100'}`}
          priority={false}
        />

        {/* Gradient Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent 
                        transition-opacity duration-500 z-[5] pointer-events-none
                        ${isHovered ? 'opacity-100' : 'opacity-0'}`} />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-20">
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-lg backdrop-blur-sm
                           ${discount > 0 ? 'bg-rose-500/90' : 'bg-blue-600/90'}`}>
            {badge}
          </span>

          <button
            onClick={handleLike}
            className={`p-2 rounded-full backdrop-blur-md transition-all duration-300 shadow-lg
                       ${isLiked 
                         ? 'bg-rose-500 text-white scale-110' 
                         : 'bg-white/90 text-gray-600 hover:bg-white hover:text-rose-500'}`}
            aria-label="Like"
          >
            {isLiked ? <FaHeart className="w-4 h-4" /> : <FaRegHeart className="w-4 h-4" />}
          </button>
        </div>

        {/* Bottom Image Info (appears on hover) */}
        <div className={`absolute bottom-3 left-3 right-3 flex justify-between items-end z-20
                        transition-all duration-500 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex gap-2">
            {amenities.slice(0, 3).map((amenity, i) => (
              <span key={i} className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg text-gray-700 shadow-sm" title={amenity}>
                {amenityIcons[amenity] || <FaExpand className="w-3.5 h-3.5" />}
              </span>
            ))}
          </div>
          <span className="text-white text-xs font-medium bg-black/40 backdrop-blur-sm px-2 py-1 rounded-lg">
            per night
          </span>
        </div>
      </div>

      {/* ═══ CONTENT SECTION ═══ */}
      <div className="flex flex-col p-5 gap-3">
        
        {/* Header: Title + Rating */}
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-lg font-bold text-gray-900 leading-tight line-clamp-1 group-hover:text-blue-700 transition-colors">
            {room.name}
          </h3>
          <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-200 shrink-0">
            <FaStar className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-bold text-yellow-700">{room.rating}</span>
          </div>
        </div>

        {/* Location + Weather */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <FaMapMarkerAlt className="w-4 h-4 text-blue-500 shrink-0" />
            <span className="truncate max-w-[140px]">{room.location}</span>
          </div>
          
          {weather && (
            <div className="flex items-center gap-1.5 bg-sky-50 px-2 py-1 rounded-lg border border-sky-100">
              <img
                src={`https://openweathermap.org/img/wn/${weather.icon}.png`}
                alt={weather.condition}
                className="w-6 h-6 -my-1"
                loading="lazy"
              />
              <span className="text-xs font-semibold text-sky-700">{weather.temp}°C</span>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="space-y-1">
          <p className={`text-gray-600 text-sm leading-relaxed transition-all duration-500 ${showMore ? '' : 'line-clamp-2'}`}>
            {room.description}
          </p>
          {room.description?.length > 80 && (
            <button
              onClick={handleShowMore}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors 
                       inline-flex items-center gap-1 mt-1"
            >
              {showMore ? 'Show Less' : 'Read More'}
              <FaArrowRight className={`w-3 h-3 transition-transform duration-300 ${showMore ? 'rotate-90' : ''}`} />
            </button>
          )}
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-4 text-xs text-gray-500 py-1">
          <span className="flex items-center gap-1 hover:text-gray-700 transition-colors cursor-default">
            <span className="text-sm">💬</span> {room.reviewCount?.toLocaleString() || 0} reviews
          </span>
          <span className="flex items-center gap-1 hover:text-gray-700 transition-colors cursor-default">
            <span className="text-sm">❤️</span> {(room.likes || 0) + (isLiked ? 1 : 0)}
          </span>
          <span className="flex items-center gap-1 hover:text-gray-700 transition-colors cursor-default">
            <span className="text-sm">🔖</span> {(room.favourites || 0) + (isFav ? 1 : 0)}
          </span>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

        {/* Price & CTA */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900">
                ${room.pricePerNight}
              </span>
              <span className="text-xs text-gray-500 font-medium">/night</span>
            </div>
            {originalPrice && (
              <span className="text-sm text-gray-400 line-through decoration-rose-400 decoration-2">
                ${originalPrice}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {room.isReviewed && (
              <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-bold 
                             px-3 py-1.5 rounded-full border border-emerald-200">
                <MdVerified className="w-4 h-4" />
                Verified
              </span>
            )}
            <span className={`p-2 rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/30
                           transition-all duration-300 group-hover:translate-x-1
                           ${isHovered ? 'bg-blue-700' : ''}`}>
              <FaArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default HotelCard;