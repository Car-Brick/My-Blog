"use client";

import { useState, useEffect } from "react";

const ROLES = [
  "高并发系统",
  "AI Agent",
  "分布式架构",
];

const TYPE_SPEED = 80;
const DELETE_SPEED = 40;
const PAUSE_AFTER_TYPE = 2500;
const PAUSE_AFTER_DELETE = 500;

export default function TypewriterText() {
  const [displayText, setDisplayText] = useState("");
  const [roleIndex, setRoleIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentRole = ROLES[roleIndex];

    if (!isDeleting && displayText === currentRole) {
      const timeout = setTimeout(() => setIsDeleting(true), PAUSE_AFTER_TYPE);
      return () => clearTimeout(timeout);
    }

    if (isDeleting && displayText === "") {
      const timeout = setTimeout(() => {
        setIsDeleting(false);
        setRoleIndex((prev) => (prev + 1) % ROLES.length);
      }, PAUSE_AFTER_DELETE);
      return () => clearTimeout(timeout);
    }

    const speed = isDeleting ? DELETE_SPEED : TYPE_SPEED;
    const timeout = setTimeout(() => {
      if (isDeleting) {
        setDisplayText((prev) => prev.slice(0, -1));
      } else {
        setDisplayText(currentRole.slice(0, displayText.length + 1));
      }
    }, speed);

    return () => clearTimeout(timeout);
  }, [displayText, roleIndex, isDeleting]);

  return (
    <span className="inline-flex items-center">
      <span className="text-white/80">{displayText}</span>
      <span className="cursor-blink ml-0.5 inline-block w-[2px] h-[1.1em] bg-white/70 align-middle" />
    </span>
  );
}
