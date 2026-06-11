"use client"

import { useState, useContext, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, CalendarDays } from 'lucide-react'
import { Context } from "@/context/userContext"
import { useRouter, usePathname } from 'next/navigation'
import { Button } from "@/components/ui/button"

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const { user, setUserDetails, logoutUser } = useContext(Context)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8080/api'

  /* ---------------- Close Dropdown Outside Click ---------------- */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
        menuRef.current && !menuRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false)
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  /* ---------------- Close mobile menu on route change ---------------- */
  useEffect(() => {
    setIsOpen(false)
    setProfileOpen(false)
  }, [pathname])

  /* ---------------- Avatar Color ---------------- */
  const getAvatarColor = (letter: string | undefined) => {
    if (!letter) return "bg-slate-600"
    const colors = [
      "bg-red-500","bg-orange-500","bg-amber-500","bg-yellow-500",
      "bg-green-500","bg-emerald-500","bg-teal-500","bg-cyan-500",
      "bg-sky-500","bg-blue-500","bg-indigo-500","bg-violet-500",
      "bg-purple-500","bg-fuchsia-500","bg-pink-500","bg-rose-500",
    ]
    return colors[letter.toUpperCase().charCodeAt(0) % colors.length]
  }

  const firstLetter = user?.name?.[0]?.toUpperCase()

  /* ---------------- Logout ---------------- */
  const handleLogout = async () => {
    localStorage.removeItem("token")
    setUserDetails(null)
    setProfileOpen(false)
    setIsOpen(false)

    if (logoutUser) {
      await logoutUser()
    }

    router.push('/login')
  }

  /* ---------------- Close mobile menu helper ---------------- */
  const closeMobileMenu = () => setIsOpen(false)

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/rooms", label: "Rooms" },
    { href: "/amenities", label: "Amenities" },
    { href: "/contactPage", label: "Contact" },
  ]

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">

        {/* ---------------- Logo ---------------- */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            <span className="font-bold text-white">NH</span>
          </div>
          <div>
            <h1 className="text-xl font-bold">Newtimes Hotel</h1>
            <p className="text-xs text-gray-500">A modern hotel booking experience</p>
          </div>
        </div>

        {/* ---------------- Desktop Nav ---------------- */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-amber-600 transition">
              {link.label}
            </Link>
          ))}

          {/* 🔥 My Bookings link - only when logged in */}
          {user && (
            <Link href="/mybookings" className="hover:text-amber-600 transition flex items-center gap-1.5">
              <CalendarDays size={15} />
              My Bookings
            </Link>
          )}

          {user ? (
            <div className="relative" ref={dropdownRef}>
              {/* Avatar */}
              <div
                onClick={() => setProfileOpen(prev => !prev)}
                className={`w-10 h-10 flex items-center justify-center rounded-full text-white font-semibold cursor-pointer hover:scale-105 transition ${getAvatarColor(firstLetter)}`}
              >
                {firstLetter}
              </div>

              {/* Dropdown */}
              {profileOpen && (
                <div className="absolute right-0 mt-3 w-60 bg-white border border-gray-200 rounded-xl shadow-lg p-2 space-y-1 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-gray-200">
                    <p className="font-semibold text-sm">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>

                  {user.role === "admin" && (
                    <Link href="/admindashboard/dashboard" className="block px-3 py-2 rounded-md hover:bg-gray-100 transition">
                      Admin Dashboard
                    </Link>
                  )}

                  {/* 🔥 My Bookings in dropdown too */}
                  <Link href="/mybookings" className="block px-3 py-2 rounded-md hover:bg-gray-100 transition flex items-center gap-2">
                    <CalendarDays size={14} />
                    My Bookings
                  </Link>

                  <Link href="/manage-account" className="block px-3 py-2 rounded-md hover:bg-gray-100 transition">
                    Manage Account
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-red-100 text-red-600 transition"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="px-4 py-2 rounded-md bg-amber-500 text-white hover:opacity-90 transition">
              Sign In
            </Link>
          )}

          {/* Book Now CTA */}
          <Button
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
            asChild
          >
            <Link href="/rooms">Book Now</Link>
          </Button>
        </nav>

        {/* ---------------- Mobile Toggle ---------------- */}
        <div className="flex items-center gap-4 md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* ---------------- Mobile Menu ---------------- */}
      {isOpen && (
        <div 
          className="md:hidden border-t border-gray-200 bg-white px-4 py-6 space-y-3 animate-in fade-in slide-in-from-top-2" 
          ref={menuRef}
        >
          {user && (
            <div className="flex items-center gap-3 px-2 py-2 border-b border-gray-200">
              <div className={`w-10 h-10 flex items-center justify-center rounded-full text-white font-semibold ${getAvatarColor(firstLetter)}`}>
                {firstLetter}
              </div>
              <div>
                <p className="text-sm font-semibold">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>
          )}

          {/* 🔥 Nav links now close menu on click */}
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              onClick={closeMobileMenu}
              className="block py-2 px-2 rounded-md hover:bg-gray-100 transition"
            >
              {link.label}
            </Link>
          ))}

          {/* 🔥 My Bookings in mobile menu */}
          {user && (
            <Link 
              href="/mybookings" 
              onClick={closeMobileMenu}
              className="block py-2 px-2 rounded-md hover:bg-gray-100 transition flex items-center gap-2 text-amber-600 font-medium"
            >
              <CalendarDays size={16} />
              My Bookings
            </Link>
          )}

          {user && (
            <>
              {user.role === "admin" && (
                <Link 
                  href="/admindashboard/dashboard" 
                  onClick={closeMobileMenu}
                  className="block py-2 px-2 rounded-md hover:bg-gray-100 transition"
                >
                  Admin Dashboard
                </Link>
              )}
              <Link 
                href="/manage-account" 
                onClick={closeMobileMenu}
                className="block py-2 px-2 rounded-md hover:bg-gray-100 transition"
              >
                Manage Account
              </Link>
              <button
                onClick={() => {
                  closeMobileMenu()
                  handleLogout()
                }}
                className="block w-full text-left py-2 px-2 rounded-md text-red-600 hover:bg-red-100 transition"
              >
                Logout
              </button>
            </>
          )}

          {!user && (
            <Link 
              href="/login" 
              onClick={closeMobileMenu}
              className="block mt-2 py-2 px-2 rounded-md bg-amber-500 text-white text-center hover:opacity-90 transition"
            >
              Sign In
            </Link>
          )}

          <Button
            className="w-full mt-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
            asChild
          >
            <Link href="/rooms" onClick={closeMobileMenu}>Book Now</Link>
          </Button>
        </div>
      )}
    </header>
  )
}