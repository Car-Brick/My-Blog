"use client";

import type { ReactNode } from "react";
import NoiseOverlay from "./NoiseOverlay";
import MouseGlow from "./MouseGlow";

export default function BlogAtmosphere({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      <NoiseOverlay />
      <MouseGlow />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
