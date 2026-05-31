"use client";

import { motion } from "framer-motion";
import ParticleBackground from "./ParticleBackground";
import TypewriterText from "./TypewriterText";
import HeroButton from "./HeroButton";
import MouseGlow from "@/components/atmosphere/MouseGlow";
import AuroraBackground from "@/components/atmosphere/AuroraBackground";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.18,
      delayChildren: 0.5,
    },
  },
};

const leftItemVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.9,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

export default function Hero() {
  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Layer 0: Deep gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #08080d 0%, #0a0a12 40%, #06060c 100%)",
        }}
      />

      {/* Layer 0.5: Aurora background — slow-flowing gradients */}
      <AuroraBackground intensity={1} />

      {/* Layer 1: Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse 65% 55% at 50% 45%, transparent 35%, rgba(0,0,0,0.7) 70%, rgba(0,0,0,1) 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 65% 55% at 50% 45%, transparent 35%, rgba(0,0,0,0.7) 70%, rgba(0,0,0,1) 100%)",
        }}
      />

      {/* Layer 2: Scan lines */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.005) 2px, rgba(255,255,255,0.005) 4px)",
        }}
      />

      {/* Layer 3: Blue-purple radial glow — top-right */}
      <div
        className="absolute pointer-events-none"
        style={{
          zIndex: 1,
          top: "-30%",
          right: "-15%",
          width: "70%",
          height: "70%",
          background:
            "radial-gradient(circle at center, rgba(99, 102, 241, 0.05) 0%, transparent 70%)",
        }}
      />

      {/* Layer 4: Purple radial glow — bottom-left */}
      <div
        className="absolute pointer-events-none"
        style={{
          zIndex: 1,
          bottom: "-20%",
          left: "-10%",
          width: "60%",
          height: "60%",
          background:
            "radial-gradient(circle at center, rgba(139, 92, 246, 0.04) 0%, transparent 70%)",
        }}
      />

      {/* Layer 5: Center ambient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          background:
            "radial-gradient(ellipse 60% 40% at 50% 45%, rgba(255,255,255,0.01) 0%, transparent 100%)",
        }}
      />

      {/* Layer 6: CSS Mouse glow — GPU-composited */}
      <MouseGlow />

      {/* Layer 7: Particle system */}
      <ParticleBackground />

      {/* Layer 8: Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 10,
          background:
            "radial-gradient(ellipse 70% 50% at 50% 50%, transparent 40%, rgba(0,0,0,0.5) 100%)",
        }}
      />

      {/* Layer 9: Grain */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.013]"
        style={{
          zIndex: 11,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E\")",
          backgroundRepeat: "repeat",
          backgroundSize: "256px 256px",
        }}
      />

      {/* Layer 10: Content */}
      <motion.div
        className="relative z-20 w-full max-w-5xl mx-auto px-6 md:px-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex items-center justify-between gap-8 md:gap-16">
          {/* ── Left Column: Info ── */}
          <motion.div className="flex flex-col items-start flex-1">
            {/* Thin accent line */}
            <motion.div
              variants={leftItemVariants}
              className="w-10 h-px mb-8"
              style={{
                background:
                  "linear-gradient(90deg, rgba(140,165,255,0.25), transparent)",
              }}
            />

            {/* Subtitle */}
            <motion.p
              variants={leftItemVariants}
              className="text-xl sm:text-2xl lg:text-3xl text-white/30 font-light tracking-[0.12em]"
            >
              后端 / AI / 分布式系统工程师
            </motion.p>

            {/* Typewriter with terminal prompt */}
            <motion.div
              variants={leftItemVariants}
              className="mt-6 h-9 flex items-center"
            >
              <p className="text-base sm:text-lg lg:text-xl text-white/50 font-mono tracking-wide flex items-baseline gap-1">
                <span className="text-white/25">$</span>
                <TypewriterText />
              </p>
            </motion.div>

            {/* Buttons */}
            <motion.div
              variants={leftItemVariants}
              className="flex flex-wrap items-center gap-5 mt-12"
            >
              <HeroButton href="/projects" variant="primary">
                查看项目
              </HeroButton>
              <HeroButton href="/blog" variant="secondary">
                阅读博客
              </HeroButton>
            </motion.div>
          </motion.div>

          {/* ── Right Column: 车专 — Diagonal ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.8, delay: 0.6, ease: "easeOut" }}
            className="hidden md:block relative shrink-0 select-none"
            style={{
              width: "clamp(14rem, 24vw, 22rem)",
              height: "clamp(18rem, 34vw, 30rem)",
            }}
          >
            {/* 车 — upper-right */}
            <motion.span
              className="absolute leading-none select-none"
              style={{
                top: 0,
                right: 0,
                fontSize: "clamp(5rem, 11vw, 11rem)",
                fontFamily: "'Zhi Mang Xing', cursive",
                color: "rgba(160, 180, 255, 0.25)",
                textShadow: "0 0 80px rgba(99, 102, 241, 0.08)",
              }}
              animate={{ opacity: [0.8, 1, 0.8] }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0,
              }}
            >
              车
            </motion.span>

            {/* 专 — lower-left */}
            <motion.span
              className="absolute leading-none select-none"
              style={{
                bottom: 0,
                left: 0,
                fontSize: "clamp(5rem, 11vw, 11rem)",
                fontFamily: "'Zhi Mang Xing', cursive",
                color: "rgba(160, 180, 255, 0.18)",
                textShadow: "0 0 80px rgba(99, 102, 241, 0.06)",
              }}
              animate={{ opacity: [0.6, 0.9, 0.6] }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.5,
              }}
            >
              专
            </motion.span>
          </motion.div>
        </div>

        {/* ── Scroll indicator ── */}
        <motion.div
          variants={leftItemVariants}
          className="absolute -bottom-24 left-6 md:left-10"
        >
          <motion.div
            className="w-5 h-8 rounded-full border border-white/[0.08] flex items-start justify-center p-1"
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <motion.div className="w-1 h-1.5 rounded-full bg-white/20" />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
