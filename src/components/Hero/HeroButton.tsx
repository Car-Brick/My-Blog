"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface HeroButtonProps {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
}

export default function HeroButton({
  href,
  children,
  variant = "primary",
}: HeroButtonProps) {
  return (
    <motion.a
      href={href}
      whileHover={{ y: -1 }}
      whileTap={{ y: 0, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={`
        relative inline-flex items-center justify-center
        px-8 py-3.5 rounded-full text-sm font-medium
        transition-all duration-300 group
        ${
          variant === "primary"
            ? "bg-white text-black hover:bg-white/95 hover:shadow-[0_0_24px_rgba(255,255,255,0.1)]"
            : "border border-white/[0.12] text-white/85 hover:text-white hover:border-white/[0.25] hover:bg-white/[0.02] hover:shadow-[0_0_24px_rgba(139,92,246,0.05)]"
        }
      `}
    >
      {/* Shine sweep on hover */}
      <div className="absolute inset-0 rounded-full overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <motion.div
          className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent"
          whileHover={{ translateX: "100%" }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
        />
      </div>

      <span className="relative z-10">{children}</span>
    </motion.a>
  );
}
