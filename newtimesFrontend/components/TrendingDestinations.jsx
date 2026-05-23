'use client';

import React, { useState, useEffect } from 'react';
import HotelCard from './HotelCard';
import HotelCardSkeleton from './HotelCardSkeleton';
import Title from './Title';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080/api';

const FeaturedDestination = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${backendUrl}/room/get-rooms`);
        
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        
        const data = await res.json();
        
        if (data.success) {
          const normalizedRooms = (data.data || []).map((room) => ({
            ...room,
            id: room._id || room.id,
            // Normalize fields for HotelCard props
            name: room.title || room.name,
            img: room.images?.[0] || room.img || '/placeholder-room.jpg',
            pricePerNight: room.price || room.pricePerNight,
            amenities: room.features || room.amenities || [],
          }));
          setRooms(normalizedRooms);
        } else {
          throw new Error(data.message || 'Failed to fetch rooms');
        }
      } catch (err) {
        console.error('Failed to fetch rooms:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  // Loading state
  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <Title Title="Featured" subTitle="Destinations" />
            <p className="text-gray-500 mt-2 text-sm">Loading luxury stays...</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <HotelCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Title text1="Featured" text2="Destinations" />
          <div className="mt-8 p-6 bg-red-50 border border-red-200 rounded-2xl">
            <p className="text-red-600 font-medium">Failed to load destinations</p>
            <p className="text-red-400 text-sm mt-1">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Empty state
  if (rooms.length === 0) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Title text1="Featured" text2="Destinations" />
          <div className="mt-10 text-gray-400">
            <span className="text-4xl block mb-3">🏨</span>
            <p className="text-lg">No featured destinations available right now</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title header */}
        <div className="mb-10">
          <Title text1="Featured" text2="Destinations" />
          <p className="text-gray-500 mt-2 text-sm">
            Handpicked luxury stays for your next getaway
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {rooms.slice(0, 4).map((item, index) => (
            <HotelCard key={item.id || item._id || index} room={item} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedDestination;