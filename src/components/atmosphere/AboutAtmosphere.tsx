"use client";

import type { ReactNode } from "react";
import AuroraBackground from "./AuroraBackground";
import MouseGlow from "./MouseGlow";
import ScrollReveal from "./ScrollReveal";

export default function AboutAtmosphere({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      <AuroraBackground intensity={2} />
      <MouseGlow />
      <div className="relative z-10">
        <ScrollReveal>{children}</ScrollReveal>
      </div>
    </div>
  );
}
