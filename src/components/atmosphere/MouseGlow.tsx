"use client";

import useMouseGlow from "@/hooks/useMouseGlow";

export default function MouseGlow() {
  const mouse = useMouseGlow();

  return (
    <div
      className="fixed pointer-events-none"
      style={{
        zIndex: 1,
        left: 0,
        top: 0,
        width: 400,
        height: 400,
        transform: `translate(${mouse.x - 200}px, ${mouse.y - 200}px)`,
        background:
          "radial-gradient(circle at center, rgba(139, 140, 255, 0.10) 0%, rgba(99, 102, 241, 0.05) 35%, transparent 70%)",
        opacity: mouse.x < 0 ? 0 : 1,
        transition: "opacity 0.6s ease",
        willChange: "transform",
      }}
    />
  );
}
