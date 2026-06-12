"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Moon, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

/* ─── Night Banner Component ─── */
export default function NightBanner() {
  const router = useRouter();
  const [stars, setStars] = useState([]);

  useEffect(() => {
    const generated = [];
    for (let i = 0; i < 80; i++) {
      generated.push({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 60, // keep stars in upper portion
        size: Math.random() * 2 + 1,
        delay: Math.random() * 4,
        duration: Math.random() * 2 + 1.5,
        opacity: Math.random() * 0.6 + 0.4,
      });
    }
    setStars(generated);
  }, []);

  return (
    <section onClick={()=>router.push('/rooms')} className="relative w-full overflow-hidden rounded-none">
      {/* Background Image — Night Sky with Moon */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=1920&q=80')`,
        }}
      />

      {/* Dark overlay for depth */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Animated Stars Layer */}
      <div className="absolute inset-0 overflow-hidden">
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
              boxShadow: `0 0 ${star.size * 3}px rgba(255,255,255,0.6)`,
            }}
          />
        ))}
      </div>

      {/* Moon Glow Effect */}
      <div className="absolute top-8 right-12 lg:right-24">
        <div className="relative">
          <div className="h-16 w-16 rounded-full bg-white/90 shadow-[0_0_40px_15px_rgba(255,250,220,0.3)] lg:h-20 lg:w-20" />
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white via-white/80 to-stone-300/60" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-[1920px] px-6 py-16 sm:px-8 sm:py-20 lg:px-16 lg:py-24">
        <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Left — Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-xl"
          >
            <div className="mb-4 flex items-center gap-2 text-white/70">
              <Moon className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-[0.2em]">
                Under the Stars
              </span>
            </div>
            <h2 className="font-serif text-3xl font-light italic text-white sm:text-4xl lg:text-5xl">
              Sleep Where the Night
              <br />
              <span className="font-normal not-italic">Meets Luxury</span>
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/60 lg:text-base">
              Experience our premium rooms with ocean views, starlit balconies, and the comfort you deserve.
            </p>
          </motion.div>

          {/* Right — CTA Button */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            <button
              onClick={() => router.push("/rooms")}
              className="group flex items-center gap-3 rounded-none bg-white px-8 py-4 text-sm font-semibold text-stone-900 transition-all duration-300 hover:bg-stone-100 hover:pl-10 hover:pr-6"
            >
              <button className="h-4 w-4 text-amber-500" />
              Explore Rooms
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </motion.div>
        </div>
      </div>

      {/* Bottom fade to blend with next section */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/20 to-transparent" />

      {/* CSS Keyframes */}
      <style jsx>{`
        @keyframes twinkle {
          0% { opacity: 0.2; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1.3); }
        }
      `}</style>
    </section>
  );
}