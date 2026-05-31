"use client";

interface Props {
  intensity?: number; // 1–3, default 2
}

export default function AuroraBackground({ intensity = 2 }: Props) {
  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
    >
      <div
        style={{
          position: "absolute",
          top: "-40%",
          right: "-20%",
          width: "90%",
          height: "90%",
          background:
            "radial-gradient(ellipse at center, rgba(99,102,241,0.04) 0%, transparent 60%)",
          backgroundSize: "250% 250%",
          animation: `aurora-shift-1 ${25 / intensity}s ease-in-out infinite`,
          willChange: "background-position",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-30%",
          left: "-15%",
          width: "80%",
          height: "80%",
          background:
            "radial-gradient(ellipse at center, rgba(139,92,246,0.035) 0%, transparent 60%)",
          backgroundSize: "250% 250%",
          animation: `aurora-shift-2 ${33 / intensity}s ease-in-out infinite`,
          willChange: "background-position",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "30%",
          width: "60%",
          height: "60%",
          background:
            "radial-gradient(ellipse at center, rgba(59,130,246,0.02) 0%, transparent 60%)",
          backgroundSize: "250% 250%",
          animation: `aurora-shift-3 ${40 / intensity}s ease-in-out infinite`,
          willChange: "background-position",
        }}
      />
    </div>
  );
}
