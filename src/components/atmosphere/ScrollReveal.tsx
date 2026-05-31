"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

const revealVariants: Variants = {
  hidden: { opacity: 0, y: 16, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

export default function ScrollReveal({ children }: { children: ReactNode }) {
  return (
    <motion.div
      variants={revealVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
    >
      {children}
    </motion.div>
  );
}
