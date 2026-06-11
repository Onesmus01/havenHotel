"use client"

import { Crown, ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"

export default function RoomsBanner() {
  return (
    <Link href="/rooms" className="block group">
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#1f1913] via-[#3d3124] to-[#5c4a36] shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-0.5">
        {/* Decorative pattern */}
        <div 
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c5a55a' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />

        {/* Glow effects */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#c5a55a]/10 rounded-full blur-3xl group-hover:bg-[#c5a55a]/15 transition-all duration-700" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#c5a55a]/5 rounded-full blur-3xl group-hover:bg-[#c5a55a]/10 transition-all duration-700" />

        {/* Desktop / Tablet — full banner */}
        <div className="hidden sm:flex relative z-10 items-center justify-between px-6 py-4">
          {/* Left content */}
          <div className="flex items-center gap-4">
            {/* Icon badge */}
            <div className="relative shrink-0">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#c5a55a] to-[#b8944f] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-[#c5a55a] animate-pulse" />
            </div>

            {/* Text */}
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <div className="h-px w-6 bg-gradient-to-r from-[#c5a55a] to-transparent" />
                <span className="text-[#c5a55a] text-[10px] uppercase tracking-[0.2em] font-semibold">Luxury Collection</span>
              </div>
              <h2 className="font-serif text-xl font-bold text-white leading-tight">
                Explore All Rooms
              </h2>
              <p className="text-[#e8d5a3]/60 text-xs font-serif italic">
                From Deluxe to Presidential
              </p>
            </div>
          </div>

          {/* Right — CTA */}
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-[#c5a55a]/20 rounded-xl px-4 py-2.5 group-hover:bg-white/15 group-hover:border-[#c5a55a]/40 transition-all duration-500">
            <span className="text-white font-medium text-sm">View Rooms</span>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#c5a55a] to-[#b8944f] flex items-center justify-center shadow-md group-hover:translate-x-1 transition-transform duration-300">
              <ArrowRight className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        {/* Mobile — thin compact badge */}
        <div className="flex sm:hidden relative z-10 items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#c5a55a] to-[#b8944f] flex items-center justify-center shadow-md">
              <Crown className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-serif text-sm font-bold text-white leading-tight">
                See All Rooms
              </h2>
              <p className="text-[#e8d5a3]/50 text-[10px]">
                Deluxe to Presidential
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-white text-xs font-medium">View</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#c5a55a]" />
          </div>
        </div>

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#c5a55a] to-transparent opacity-40 group-hover:opacity-80 transition-opacity duration-500" />
      </div>
    </Link>
  )
}