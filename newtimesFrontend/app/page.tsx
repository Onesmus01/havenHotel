"use client"

import { useRouter } from "next/navigation";
import { useEffect, useState,useContext ,useRef} from "react";
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Wifi,Gem,Bed,Ruler,ArrowRight,CalendarCheck,Phone,Check, Car,Crown, Coffee, Utensils, Dumbbell, Waves } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import {Context} from '@/context/userContext.js'
import FeaturedDestinations from "@/components/TrendingDestinations";
import RoomsPage from "@/components/RoomCard";
import Hero from "@/components/Hero";
import Divider from "@/components/Divider";
import ContactSection from "@/components/ContactSection";
import RoomsBanner from "@/components/RoomsBanner"

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080/api";


export default function HomePage() {
  const {user,setUserDetails} = useContext(Context);
  console.log('user details',user)
  const features = [
    { icon: Wifi, label: "Free WiFi" },
    { icon: Car, label: "Free Parking" },
    { icon: Coffee, label: "24/7 Room Service" },
    { icon: Utensils, label: "Restaurant" },
    { icon: Dumbbell, label: "Fitness Center" },
    { icon: Waves, label: "Swimming Pool" },
  ]

  const testimonials = [
    {
      name: "Sarah waiguru",
      rating: 5,
      comment:
        "Absolutely stunning hotel with exceptional service. The rooms are luxurious and the staff went above and beyond.",
      location: "Mombasa, Kenya",
    },
    {
      name: "Michael ouma",
      rating: 5,
      comment:
        "Perfect location and amazing amenities. The rooftop pool is incredible and the breakfast was outstanding.",
      location: "Nairobi, Kenya",
    },
    {
      name: "Benedict Nzulu",
      rating: 5,
      comment: "Best hotel experience I've ever had. Clean, modern, and the booking process was seamless.",
      location: "Mombasa, Kenya",
    },
  ]

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080/api";

  const [hero, setHero] = useState(null);
  const [rooms, setRooms] = useState([]);


  // Fetch active hero image from backend
  const fetchHero = async () => {
    try {
      const res = await fetch(`${backendUrl}/room/hero/active`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      setHero(data);
    } catch (err) {
      console.error("Failed to fetch hero image:", err);
    }
  };

  useEffect(() => {
    fetchHero();
  }, []);

  useEffect(() => {
      const fetchRooms = async () => {
        try {
          const res = await fetch(`${backendUrl}/room/get-rooms`);
          const data = await res.json();
          if (data.success) {
            const normalizedRooms = (data.data || []).map((room) => ({
              ...room,
              _id: room._id || room.id, // normalize ID
            }));
            setRooms(normalizedRooms);
          }
        } catch (err) {
          console.error("Failed to fetch rooms:", err);
        }
      };
      fetchRooms();
    }, []);

  console.log("Active hero image:", hero);
  console.log("Fetched rooms:", rooms);

  

  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const router = useRouter();

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  

  const handleLogout = async () => {
    try {
      await fetch(`${backendUrl}/user/logout`, {
        method: "POST",
        credentials: "include",
      });
      setUserDetails(null);
      router.push("/login");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Hero user={user} />

      <Divider variant="shortAmber" className="my-8" />



      {/* Hero Section */}

    
    

      {/* Room Preview Section */}
      <RoomsPage  />

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-foreground">World-Class Amenities</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Every detail designed for your comfort and convenience
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <p className="font-medium text-foreground">{feature.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Testimonials Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-foreground">What Our Guests Say</h2>
            <p className="text-xl text-muted-foreground">Hear from travelers who've experienced our hospitality</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">"{testimonial.comment}"</p>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 bg-gradient-to-br from-[#1f1913] via-[#3d3124] to-[#5c4a36] overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c5a55a' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <div className="flex items-center gap-4 mb-8 justify-center">
            <div className="h-px w-20 bg-gradient-to-r from-transparent to-[#c5a55a]" />
            <Crown className="text-[#c5a55a] w-6 h-6" />
            <div className="h-px w-20 bg-gradient-to-l from-transparent to-[#c5a55a]" />
          </div>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6">
            Ready for Your Perfect Stay?
          </h2>
          <p className="text-xl text-[#e8d5a3]/80 mb-10 max-w-2xl mx-auto font-serif italic">
            Book now and experience luxury like never before. Special rates available for extended stays.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-[#1f1913] hover:bg-[#f0ebe3] text-lg px-8 py-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5 font-semibold"
              asChild
            >
              <Link href="/rooms" className="flex items-center gap-2">
                <CalendarCheck className="w-5 h-5" />
                Book Your Stay
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-[#c5a55a]/40 text-[#e8d5a3] hover:bg-[#c5a55a]/10 text-lg px-8 py-6 rounded-2xl bg-transparent backdrop-blur-sm transition-all hover:-translate-y-0.5 font-semibold"
            >
              <span className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                +254 759 755 575
              </span>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">LH</span>
                </div>
                <span className="text-xl font-bold">Luxury Haven</span>
              </div>
              <p className="text-gray-400 mb-4">Experience unparalleled luxury and comfort in the heart of the city.</p>
              <div className="flex items-center space-x-1 text-amber-400">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">123 Luxury Avenue, City Center</span>
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/rooms" className="hover:text-white transition-colors">
                    Rooms & Suites
                  </Link>
                </li>
                <li>
                  <Link href="/amenities" className="hover:text-white transition-colors">
                    Amenities
                  </Link>
                </li>
                <li>
                  <Link href="/dining" className="hover:text-white transition-colors">
                    Dining
                  </Link>
                </li>
                <li>
                  <Link href="/events" className="hover:text-white transition-colors">
                    Events
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4">Services</h3>
              <ul className="space-y-2 text-gray-400">
                <li>24/7 Concierge</li>
                <li>Airport Transfer</li>
                <li>Spa & Wellness</li>
                <li>Business Center</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4">Contact Info</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Phone: +1 (555) 123-4567</li>
                <li>Email: info@newtimesluxuryhaven.com</li>
                <li>Check-in: 3:00 PM</li>
                <li>Check-out: 11:00 AM</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Luxury Haven Hotel. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
