"use client";

import { useState, useRef } from "react";

export default function Tooltip({ children, text }: { children: React.ReactNode; text: string }) {
  const [show, setShow] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleEnter = () => {
    timeoutRef.current = setTimeout(() => setShow(true), 400);
  };

  const handleLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShow(false);
  };

  return (
    <span
      className="relative inline-flex cursor-help"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {children}
      {show && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-xl bg-[#1d1d1f] border border-white/[0.1] text-[11px] text-[#86868b] leading-relaxed whitespace-normal w-56 text-center shadow-xl shadow-black/40 z-50 animate-fade-in-up pointer-events-none">
          {text}
        </span>
      )}
    </span>
  );
}
