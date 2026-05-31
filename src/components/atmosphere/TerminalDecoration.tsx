"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LOG_LINES = [
  "[INFO]  System boot sequence completed",
  "[INFO]  JVM Interview Loaded — 3 experiences indexed",
  "[INFO]  Redis Questions Synced — cache warm",
  "[OK]    Kafka Notes Indexed — 12 partitions",
  "[INFO]  Connection pool established — max: 64",
  "[OK]    Health check passed — latency 2ms",
  "[INFO]  gRPC reflection service registered",
  "[DEBG]  Circuit breaker state: CLOSED",
  "[INFO]  Metrics exporter connected — Prometheus",
  "[OK]    TLS handshake completed — TLS 1.3",
];

export default function TerminalDecoration() {
  const [lines, setLines] = useState<string[]>(LOG_LINES.slice(0, 6));
  const [key, setKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLines((prev) => {
        const next = [...prev.slice(1), LOG_LINES[Math.floor(Math.random() * LOG_LINES.length)]];
        return next;
      });
      setKey((k) => k + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="fixed bottom-6 right-6 pointer-events-none select-none"
      style={{ zIndex: 5 }}
    >
      <AnimatePresence mode="popLayout">
        <div className="space-y-1" key={key}>
          {lines.map((line, i) => (
            <motion.p
              key={`${line}-${i}`}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-[10px] font-mono leading-relaxed text-white/[0.10]"
            >
              {line}
            </motion.p>
          ))}
        </div>
      </AnimatePresence>
    </div>
  );
}
