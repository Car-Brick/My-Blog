"use client";

import type { ReactNode } from "react";
import TechGrid from "./TechGrid";
import ScanLine from "./ScanLine";
import MouseGlow from "./MouseGlow";

export default function ProjectsAtmosphere({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      <TechGrid cellSize={64} opacity={0.035} />
      <ScanLine />
      <MouseGlow />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
