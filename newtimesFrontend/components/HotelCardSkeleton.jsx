// components/HotelCardSkeleton.jsx
'use client';

import React from 'react';

const HotelCardSkeleton = () => (
  <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
    <div className="h-60 bg-gray-200 animate-pulse" />
    <div className="p-5 space-y-3">
      <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse" />
      <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
      <div className="h-3 bg-gray-200 rounded w-full animate-pulse" />
      <div className="h-3 bg-gray-200 rounded w-5/6 animate-pulse" />
      <div className="flex gap-2 pt-2">
        <div className="h-6 bg-gray-200 rounded-full w-16 animate-pulse" />
        <div className="h-6 bg-gray-200 rounded-full w-16 animate-pulse" />
      </div>
    </div>
  </div>
);

export default HotelCardSkeleton;