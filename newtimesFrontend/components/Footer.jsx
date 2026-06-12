"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">LH</span>
              </div>
              <span className="text-xl font-bold">Luxury Haven</span>
            </div>
            <p className="text-gray-400 mb-4">
              Experience unparalleled luxury and comfort in the heart of the city.
            </p>
            <div className="flex items-center space-x-1 text-amber-400">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">123 Luxury Avenue, City Center</span>
            </div>
          </div>

          {/* Quick Links */}
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

          {/* Services */}
          <div>
            <h3 className="font-bold mb-4">Services</h3>
            <ul className="space-y-2 text-gray-400">
              <li>24/7 Concierge</li>
              <li>Airport Transfer</li>
              <li>Spa & Wellness</li>
              <li>Business Center</li>
            </ul>
          </div>

          {/* Contact Info */}
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

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Luxury Haven Hotel. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}