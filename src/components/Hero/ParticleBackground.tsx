"use client";

import { useEffect, useRef, useCallback } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseSpeed: number;
  tint: "white" | "blue";
  isNode: boolean;
  layer: "far" | "near";
}

interface FlowLine {
  points: { x: number; y: number }[];
  offsets: { x: number; y: number }[];
  speeds: { x: number; y: number }[];
  opacity: number;
}

const BASE_COUNT = 160;
const MIN_RADIUS_RATIO = 0.4; // keep particles out of central 40%
const CONNECTION_DISTANCE_FAR = 80;
const CONNECTION_DISTANCE_NEAR = 200;
const MOUSE_RADIUS = 250;
const MOUSE_FORCE = 0.04;
const MOUSE_CONNECTION_RADIUS = 125;
const FLOW_LINE_COUNT = 6;
const NODE_COUNT = 4;
const MOUSE_LERP = 0.06;
const FAR_RATIO = 0.85;

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const nearIndicesRef = useRef<number[]>([]); // indices of near + node particles for O(n²) connection optimization
  const flowLinesRef = useRef<FlowLine[]>([]);
  const mouseTargetRef = useRef({ x: -1000, y: -1000 });
  const mouseSmoothRef = useRef({ x: -1000, y: -1000 });
  const animFrameRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const dimensionsRef = useRef({ w: 0, h: 0 });

  const initParticles = useCallback((w: number, h: number) => {
    const particles: Particle[] = [];
    const nearIndices: number[] = [];
    const cx = w / 2;
    const cy = h / 2;
    const maxR = Math.sqrt(cx * cx + cy * cy);
    const totalCount = Math.floor((BASE_COUNT * w * h) / (1920 * 1080));
    const nearCount = Math.max(4, Math.floor(totalCount * (1 - FAR_RATIO)));
    const farCount = totalCount - nearCount - NODE_COUNT;

    // ── Far layer (~85%): small, slow, white only, no connections ──
    const minR = maxR * MIN_RADIUS_RATIO;
    const maxRange = maxR * 1.05;
    for (let i = 0; i < farCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = minR + Math.pow(Math.random(), 0.5) * (maxRange - minR);
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      const baseSpeed = 0.10 + Math.random() * 0.20;
      const angle2 = Math.random() * Math.PI * 2;

      particles.push({
        x,
        y,
        vx: Math.cos(angle2) * baseSpeed * 0.5,
        vy: Math.sin(angle2) * baseSpeed * 0.5,
        radius: 0.3 + Math.random() * 0.7,
        baseSpeed,
        tint: "white",
        isNode: false,
        layer: "far",
      });
    }

    // ── Near layer (~15%): larger, faster, 50% blue, connections enabled ──
    for (let i = 0; i < nearCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = minR + Math.pow(Math.random(), 0.5) * (maxRange - minR);
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      const baseSpeed = 0.30 + Math.random() * 0.40;
      const angle2 = Math.random() * Math.PI * 2;
      const idx = particles.length;

      particles.push({
        x,
        y,
        vx: Math.cos(angle2) * baseSpeed * 0.5,
        vy: Math.sin(angle2) * baseSpeed * 0.5,
        radius: 1.5 + Math.random() * 2.0,
        baseSpeed,
        tint: Math.random() < 0.5 ? "blue" : "white",
        isNode: false,
        layer: "near",
      });
      nearIndices.push(idx);
    }

    // ── Energy nodes: belong to near layer for connections ──
    for (let i = 0; i < NODE_COUNT; i++) {
      const angle = (i / NODE_COUNT) * Math.PI * 2 + Math.random() * 0.5;
      const radius = maxR * (0.4 + Math.random() * 0.45);
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius * 0.6;
      const idx = particles.length;

      particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        radius: 1.8 + Math.random() * 1.2,
        baseSpeed: 0.1,
        tint: "blue",
        isNode: true,
        layer: "near",
      });
      nearIndices.push(idx);
    }

    particlesRef.current = particles;
    nearIndicesRef.current = nearIndices;
    dimensionsRef.current = { w, h };
  }, []);

  const initFlowLines = useCallback((w: number, h: number) => {
    const lines: FlowLine[] = [];
    for (let i = 0; i < FLOW_LINE_COUNT; i++) {
      const points: { x: number; y: number }[] = [];
      const offsetCount = 3 + Math.floor(Math.random() * 2);
      const startX = Math.random() * w;
      const startY = Math.random() * h;
      const endX = Math.random() * w;
      const endY = Math.random() * h;

      for (let j = 0; j <= offsetCount; j++) {
        const t = j / offsetCount;
        points.push({
          x: startX + (endX - startX) * t + (Math.random() - 0.5) * w * 0.3,
          y: startY + (endY - startY) * t + (Math.random() - 0.5) * h * 0.3,
        });
      }

      lines.push({
        points,
        offsets: points.map(() => ({
          x: (Math.random() - 0.5) * 60,
          y: (Math.random() - 0.5) * 60,
        })),
        speeds: points.map(() => ({
          x: (Math.random() - 0.5) * 0.15,
          y: (Math.random() - 0.5) * 0.15,
        })),
        opacity: 0.02 + Math.random() * 0.025,
      });
    }
    flowLinesRef.current = lines;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initParticles(w, h);
      initFlowLines(w, h);
    };

    const onMouseMove = (e: MouseEvent) => {
      mouseTargetRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseLeave = () => {
      mouseTargetRef.current = { x: -1000, y: -1000 };
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);

    const animate = () => {
      const { w, h } = dimensionsRef.current;
      const particles = particlesRef.current;
      const nearIndices = nearIndicesRef.current;
      const flowLines = flowLinesRef.current;
      const target = mouseTargetRef.current;
      const smooth = mouseSmoothRef.current;
      const t = timeRef.current;

      // Smooth mouse position with lerp (inertia)
      smooth.x += (target.x - smooth.x) * MOUSE_LERP;
      smooth.y += (target.y - smooth.y) * MOUSE_LERP;

      ctx.clearRect(0, 0, w, h);

      // ── Flow lines ──
      for (const line of flowLines) {
        for (let i = 0; i < line.offsets.length; i++) {
          line.offsets[i].x += line.speeds[i].x;
          line.offsets[i].y += line.speeds[i].y;
          if (Math.abs(line.offsets[i].x) > 80) line.speeds[i].x *= -1;
          if (Math.abs(line.offsets[i].y) > 80) line.speeds[i].y *= -1;
        }

        const pts = line.points.map((p, i) => ({
          x: p.x + line.offsets[i].x,
          y: p.y + line.offsets[i].y,
        }));

        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length - 1; i += 2) {
          const cp1 = pts[i];
          const cp2 = pts[i + 1] || pts[i];
          const ep = pts[i + 1] || pts[i];
          ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, ep.x, ep.y);
        }
        ctx.strokeStyle = `rgba(140, 165, 255, ${line.opacity})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // ── Connections (near-layer + nodes only, O(n²) on ~15% of particles) ──
      for (let ni = 0; ni < nearIndices.length; ni++) {
        for (let nj = ni + 1; nj < nearIndices.length; nj++) {
          const i = nearIndices[ni];
          const j = nearIndices[nj];
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONNECTION_DISTANCE_NEAR) {
            const base = (1 - dist / CONNECTION_DISTANCE_NEAR) * 0.08;
            const synapsePulse =
              Math.sin(t * 0.02 + i * 3.7 + j * 1.3) * 0.5 + 0.5;
            const pulseBoost =
              synapsePulse > 0.92 ? (synapsePulse - 0.92) * 0.15 : 0;
            let opacity = base + pulseBoost;

            // Mouse-enhanced connection: midpoint near mouse → blue tint + brighten
            const midX = (particles[i].x + particles[j].x) / 2;
            const midY = (particles[i].y + particles[j].y) / 2;
            const mouseDx = midX - smooth.x;
            const mouseDy = midY - smooth.y;
            const mouseDist = Math.sqrt(mouseDx * mouseDx + mouseDy * mouseDy);

            if (mouseDist < MOUSE_CONNECTION_RADIUS && smooth.x > 0) {
              const mouseFactor =
                1 - mouseDist / MOUSE_CONNECTION_RADIUS;
              opacity += mouseFactor * 0.06;
              // Lerp toward blue: white(255,255,255) → blue(140,165,255)
              const r = Math.round(255 - (255 - 140) * mouseFactor);
              const g = Math.round(255 - (255 - 165) * mouseFactor);
              const b = 255;
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${Math.min(opacity, 0.2)})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            } else if (opacity > 0.001) {
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        }
      }

      // ── Update & draw particles ──
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Mouse influence — near particles get stronger push
        if (p.layer === "near") {
          const dx = p.x - smooth.x;
          const dy = p.y - smooth.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < MOUSE_RADIUS && dist > 0) {
            const rawForce = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
            const easedForce = rawForce * rawForce;
            // Near particles get full force, far particles get reduced
            const layerMultiplier = p.layer === "near" ? 1.0 : 0.3;
            p.vx += (dx / dist) * easedForce * MOUSE_FORCE * layerMultiplier;
            p.vy += (dy / dist) * easedForce * MOUSE_FORCE * layerMultiplier;
          }
        }

        // Damping + return
        const currentSpeed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (currentSpeed > 0) {
          const damping = 0.998;
          const returnStrength = 0.0005;
          p.vx =
            p.vx * damping +
            (p.vx / currentSpeed) * p.baseSpeed * returnStrength;
          p.vy =
            p.vy * damping +
            (p.vy / currentSpeed) * p.baseSpeed * returnStrength;
        }

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;

        // Energy node glow (near-layer nodes only)
        if (p.isNode) {
          const pulse = Math.sin(t * 0.015 + i) * 0.3 + 0.7;
          const glowRadius = p.radius * 3;
          const gradient = ctx.createRadialGradient(
            p.x,
            p.y,
            0,
            p.x,
            p.y,
            glowRadius
          );
          gradient.addColorStop(0, `rgba(140, 165, 255, ${0.06 * pulse})`);
          gradient.addColorStop(0.5, `rgba(140, 165, 255, ${0.02 * pulse})`);
          gradient.addColorStop(1, "rgba(140, 165, 255, 0)");
          ctx.beginPath();
          ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);

        const baseAlpha =
          p.layer === "far"
            ? 0.08 + p.radius * 0.04
            : p.isNode
              ? 0.45
              : 0.15 + p.radius * 0.04;

        if (p.tint === "blue") {
          ctx.fillStyle = `rgba(140, 165, 255, ${baseAlpha})`;
        } else {
          ctx.fillStyle = `rgba(255, 255, 255, ${baseAlpha})`;
        }
        ctx.fill();
      }

      timeRef.current += 1;
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [initParticles, initFlowLines]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
