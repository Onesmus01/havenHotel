"use client";

import { motion, AnimatePresence } from "framer-motion";
import Room  from "../../lib/rooms.ts"
  
";
import RoomCard from "./RoomCard.jsx";
import RoomDetail from "./RoomDetail";
import { useState, useMemo } from "react";

interface RoomGridProps {
  rooms: Room[];
  activeCategory: string;
  searchQuery: string;
}

export default function RoomGrid({ rooms, activeCategory, searchQuery }: RoomGridProps) {
  const [selectedRoom, setSelectedRoom] = useState<<Room | null>(null);

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const matchesSearch = 
        room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.amenities.some(a => a.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = 
        activeCategory === "All" ||
        (activeCategory === "Featured" && room.featured) ||
        (activeCategory === "Ocean View" && room.amenities.includes("Ocean View")) ||
        (activeCategory === "Suite" && room.name.includes("Suite")) ||
        (activeCategory === "Family" && room.guests >= 4);

      return matchesSearch && matchesCategory;
    });
  }, [rooms, activeCategory, searchQuery]);

  return (
    <>
      <div id="rooms" className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="mb-3 text-3xl font-bold text-stone-900 md:text-4xl">
            Our <span className="font-serif italic text-amber-600">Rooms</span> & Suites
          </h2>
          <p className="mx-auto max-w-2xl text-stone-500">
            Each space is thoughtfully designed to blend comfort with elegance, offering a unique experience for every guest.
          </p>
        </motion.div>

        <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredRooms.map((room, index) => (
              <motion.div
                key={room.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
              >
                <RoomCard
                  room={room}
                  index={index}
                  onSelect={setSelectedRoom}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredRooms.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-20 text-center text-stone-400"
          >
            No rooms found matching your criteria.
          </motion.div>
        )}
      </div>

      <RoomDetail room={selectedRoom} onClose={() => setSelectedRoom(null)} />
    </>
  );
}