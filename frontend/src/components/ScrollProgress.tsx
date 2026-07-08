"use client";

import { useEffect, useState } from "react";

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let lastScrollY = 0;

    function handleScroll() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

      setProgress(scrolled);
      setVisible(scrollTop > 0 && scrollTop >= lastScrollY);
      lastScrollY = scrollTop;
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 pointer-events-none"
      style={{
        height: "3px",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.3s ease",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${progress}%`,
          background: "linear-gradient(90deg, var(--scroll-a), var(--scroll-b))",
          transition: "width 0.15s ease-out",
        }}
      />
    </div>
  );
}
