"use client";

import { useState, useEffect, useRef } from "react";

const LERP = 0.05;

export default function useMouseGlow() {
  const [pos, setPos] = useState({ x: -1000, y: -1000 });
  const targetRef = useRef({ x: -1000, y: -1000 });
  const smoothRef = useRef({ x: -1000, y: -1000 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
    };
    const onLeave = () => {
      targetRef.current = { x: -1000, y: -1000 };
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);

    const tick = () => {
      const t = targetRef.current;
      const s = smoothRef.current;
      s.x += (t.x - s.x) * LERP;
      s.y += (t.y - s.y) * LERP;
      setPos({ x: s.x, y: s.y });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return pos;
}
