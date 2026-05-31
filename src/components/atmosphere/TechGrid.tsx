interface Props {
  cellSize?: number;
  opacity?: number;
}

export default function TechGrid({ cellSize = 64, opacity = 0.015 }: Props) {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,${opacity}) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,${opacity}) 1px, transparent 1px)`,
        backgroundSize: `${cellSize}px ${cellSize}px`,
        maskImage:
          "radial-gradient(ellipse 70% 50% at 50% 40%, transparent 30%, rgba(0,0,0,0.6) 70%, rgba(0,0,0,1) 100%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 70% 50% at 50% 40%, transparent 30%, rgba(0,0,0,0.6) 70%, rgba(0,0,0,1) 100%)",
      }}
    />
  );
}
