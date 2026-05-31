export default function ScanLine() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          height: 80,
          background:
            "linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.008) 45%, rgba(255,255,255,0.02) 50%, rgba(255,255,255,0.008) 55%, transparent 100%)",
          animation: "scanline 10s linear infinite",
        }}
      />
    </div>
  );
}
