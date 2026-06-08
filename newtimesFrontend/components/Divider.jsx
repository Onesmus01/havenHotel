"use client";

import { motion } from "framer-motion";

export default function Divider({
  variant = "default",
  className = "",
  animated = false,
}) {
  const variants = {
    default: "border-t border-stone-200",
    dark: "border-t border-stone-800",
    thick: "border-t-2 border-stone-200",
    thickDark: "border-t-2 border-stone-900",
    dashed: "border-t border-dashed border-stone-300",
    dotted: "border-t border-dotted border-stone-300",
    amber: "border-t border-amber-400",
    gradient: "h-px bg-gradient-to-r from-transparent via-stone-400 to-transparent border-0",
    gradientAmber: "h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent border-0",
    double: "border-t border-b border-stone-200 h-1",
    short: "mx-auto w-24 border-t border-stone-300",
    shortAmber: "mx-auto w-24 border-t-2 border-amber-500",
    fade: "border-t border-stone-200 opacity-50",
  };

  const base = variants[variant] || variants.default;

  if (animated) {
    return (
      <motion.hr
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className={`origin-left ${base} ${className}`}
      />
    );
  }

  return <hr className={`${base} ${className}`} />;
}