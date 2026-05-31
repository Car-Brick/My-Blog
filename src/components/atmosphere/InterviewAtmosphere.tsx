"use client";

import type { ReactNode } from "react";
import TechGrid from "./TechGrid";
import TerminalDecoration from "./TerminalDecoration";
import MouseGlow from "./MouseGlow";

export default function InterviewAtmosphere({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      {/* Soft purple ambient glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          zIndex: 0,
          bottom: "10%",
          left: "50%",
          width: "50%",
          height: "30%",
          transform: "translateX(-50%)",
          background:
            "radial-gradient(ellipse at center, rgba(99,102,241,0.03) 0%, transparent 70%)",
        }}
      />
      <TechGrid cellSize={48} opacity={0.028} />
      <TerminalDecoration />
      <MouseGlow />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
