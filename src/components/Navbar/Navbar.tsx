"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const NAV_ITEMS = [
  { label: "About", href: "/about" },
  { label: "Projects", href: "/projects" },
  { label: "Blog", href: "/blog" },
  { label: "Interview", href: "/interview" },
] as const;

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // ── Scroll detection ──────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Lock body scroll when mobile menu is open ──────────────────
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // ── Close mobile menu on route change ──────────────────────────
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // ── Active check ───────────────────────────────────────────────
  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <>
      {/* ── Navbar ──────────────────────────────────────────────── */}
      <header
        className={[
          "fixed top-0 inset-x-0 z-50 h-[52px] flex items-center transition-all duration-500",
          scrolled
            ? "bg-[#08080d]/75 backdrop-blur-xl border-b border-white/[0.06]"
            : "bg-[#08080d]/25 backdrop-blur-[3px] border-b border-white/[0.02]",
        ].join(" ")}
      >
        <nav className="w-full max-w-5xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="text-sm font-semibold tracking-tight text-white/80 hover:text-white transition-colors duration-300"
          >
            车 专
          </Link>

          {/* Desktop links */}
          <ul className="hidden md:flex items-center gap-0.5">
            {NAV_ITEMS.map(({ label, href }) => {
              const active = isActive(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={[
                      "relative inline-flex items-center px-3.5 py-1.5 text-[13px] font-medium rounded-md transition-all duration-300",
                      active
                        ? "text-white/90"
                        : "text-white/45 hover:text-white/75",
                    ].join(" ")}
                  >
                    {label}
                    {active && (
                      <motion.span
                        layoutId="nav-active-dot"
                        className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white/50"
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                        }}
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden relative z-60 w-8 h-8 flex flex-col items-center justify-center gap-[5px]"
            aria-label="Toggle menu"
          >
            <motion.span
              animate={
                mobileOpen ? { rotate: 45, y: 5.5 } : { rotate: 0, y: 0 }
              }
              transition={{ duration: 0.2 }}
              className="block w-[18px] h-px bg-white/55"
            />
            <motion.span
              animate={
                mobileOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }
              }
              transition={{ duration: 0.15 }}
              className="block w-[18px] h-px bg-white/55"
            />
            <motion.span
              animate={
                mobileOpen ? { rotate: -45, y: -5.5 } : { rotate: 0, y: 0 }
              }
              transition={{ duration: 0.2 }}
              className="block w-[18px] h-px bg-white/55"
            />
          </button>
        </nav>
      </header>

      {/* ── Mobile overlay ──────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-[#08080d]/85 backdrop-blur-xl"
              onClick={() => setMobileOpen(false)}
            />

            {/* Links */}
            <nav className="relative z-10 flex flex-col items-center justify-center h-full gap-2">
              {NAV_ITEMS.map(({ label, href }, i) => {
                const active = isActive(href);
                return (
                  <motion.div
                    key={href}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{
                      delay: 0.06 * i,
                      duration: 0.3,
                      ease: "easeOut",
                    }}
                  >
                    <Link
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className={[
                        "text-xl font-medium tracking-tight py-2 transition-colors duration-300",
                        active
                          ? "text-white"
                          : "text-white/45 hover:text-white/80",
                      ].join(" ")}
                    >
                      {label}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
