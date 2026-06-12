"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import {
  Star,
  MapPin,
  Waves,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Phone,
  ChevronDown,
  Crown,
} from "lucide-react";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080/api";

export default function Hero({ user }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const [hero, setHero] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

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
    const t = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  const bgImage = hero?.imageUrl
    ? hero.imageUrl
    : "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80";

  return (
    <section
      ref={ref}
      className="relative min-h-scree overflow-hidden bg-neutral-50 lg:min-h-[90vh]"
    >
      {/* Top Announcement Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={isLoaded ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="relative z-20 w-full bg-stone-800 py-3 text-center"
      >
        <p className="inline-flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.2em] text-stone-300">
          <Crown className="h-3 w-3 text-amber-500" />
          <span>A beautiful haven — book a room now and stay like a king</span>
          <Crown className="h-3 w-3 text-amber-500" />
        </p>
      </motion.div>

      <div className="mx-auto flex min-h-[calc(100vh-48px)] max-w-[1920px] flex-col lg:flex-row lg:items-center lg:min-h-[calc(90vh-48px)]">
        {/* LEFT — Image Frame */}
        <motion.div
          style={{ y }}
          className="relative w-full px-4 pt-10 pb-6 lg:w-[58%] lg:px-10 lg:py-0"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={isLoaded ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative aspect-[3/4] w-full overflow-hidden rounded-[1.5rem] sm:aspect-[4/5] lg:aspect-[16/10]"
          >
            {/* Image */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 hover:scale-105"
              style={{ backgroundImage: `url('${bgImage}')` }}
            />

            {/* Subtle overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />

            {/* Floating Location Pill — Bottom Left of Image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isLoaded ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
              className="absolute bottom-5 left-5 z-10"
            >
              <div className="flex items-center gap-3 rounded-full bg-white/95 px-5 py-3 shadow-lg backdrop-blur-md">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100">
                  <MapPin className="h-4 w-4 text-stone-700" />
                </div>
                <div className="leading-none">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                    Located in
                  </p>
                  <p className="mt-0.5 text-sm font-medium text-stone-900">
                    Majengo, Mombasa
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Small Detail Badge — Top Right of Image */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={isLoaded ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 1, duration: 0.8 }}
              className="absolute top-5 right-5 z-10"
            >
              <div className="rounded-full bg-white/95 px-4 py-2 shadow-lg backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <Waves className="h-4 w-4 text-stone-500" />
                  <span className="text-xs font-medium text-stone-700">
                    Road view
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Decorative dots behind image */}
          <div className="absolute -bottom-3 -left-3 -z-10 hidden lg:block">
            <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
              <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="2" fill="#d6d3d1" />
              </pattern>
              <rect width="100" height="100" fill="url(#dots)" />
            </svg>
          </div>
        </motion.div>

        {/* RIGHT — Content */}
        <motion.div
          style={{ opacity }}
          className="flex w-full flex-col justify-center px-6 pb-2 lg:w-[42%] lg:px-14 lg:pb-0 xl:px-20"
        >
          {/* Trust Row */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mb-6 flex flex-wrap items-center gap-3 lg:mb-8"
          >
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="h-3 w-3 fill-amber-500 text-amber-500"
                />
              ))}
            </div>
            <span className="text-[11px] font-medium uppercase tracking-widest text-stone-400">
              5.0 Guest Rating
            </span>
            <span className="hidden h-3 w-px bg-stone-300 sm:block" />
            <div className="hidden items-center gap-1.5 text-stone-500 sm:flex">
              <ShieldCheck className="h-3 w-3" />
              <span className="text-[11px] font-medium">Verified Luxury</span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            {user && (
              <p className="mb-2 text-xs font-medium uppercase tracking-widest text-stone-400 lg:mb-3">
                Welcome back,{" "}
                <span className="text-stone-700 capitalize">{user.name}</span>
              </p>
            )}
            <h1 className="text-[2.5rem] font-light leading-[1.1] tracking-tight text-stone-900 sm:text-5xl lg:text-[3.2rem] xl:text-[3.6rem]">
              A quiet escape
              <span className="mt-1 block font-serif italic text-stone-600 lg:mt-2">
                by the Indian Ocean
              </span>
            </h1>
          </motion.div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="mt-5 max-w-sm text-base leading-relaxed text-stone-500 lg:mt-6 lg:max-w-md"
          >
            Handcrafted rooms, warm ocean breezes, and slow mornings that stay
            with you long after checkout. Set along the white sands of Nyali
            Beach.
          </motion.p>

          {/* Info Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.85, duration: 0.8 }}
            className="mt-6 grid grid-cols-3 gap-3 lg:mt-8 lg:gap-4"
          >
            {[
              { label: "Rooms", value: "50+" },
              { label: "Experience", value: "Since 2008" },
              { label: "Service", value: "24/7" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-stone-200 bg-white px-3 py-3 lg:px-4"
              >
                <p className="text-base font-light text-stone-900 lg:text-lg">{item.value}</p>
                <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-stone-400">
                  {item.label}
                </p>
              </div>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 1, duration: 0.8 }}
            className="mt-8 flex flex-wrap items-center gap-3 lg:mt-10"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() =>
                document.getElementById("rooms")?.scrollIntoView({ behavior: "smooth" })
              }
              className="group flex items-center gap-2 rounded-full bg-stone-900 px-7 py-3.5 text-sm font-medium text-white transition-colors hover:bg-stone-800 lg:px-8 lg:py-4"
            >
              Explore Rooms
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </motion.button>

            <motion.a
              href="tel:+254759755575"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 rounded-full border border-stone-300 bg-white px-5 py-3.5 text-sm font-medium text-stone-700 transition-colors hover:border-stone-400 hover:text-stone-900 lg:px-6 lg:py-4"
            >
              <Phone className="h-4 w-4" />
              +254 759 755 575
            </motion.a>
          </motion.div>

          {/* Bottom micro-bar */}
          
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      
    </section>
  );
}