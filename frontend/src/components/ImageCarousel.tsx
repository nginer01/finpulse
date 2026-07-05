"use client";

import { useEffect, useState } from "react";

/**
 * Carousel de imágenes que rota solo cada ~5s con crossfade suave.
 * Sustituto de vídeo donde no hay assets. Ken Burns sutil en cada slide.
 */
export default function ImageCarousel({
  images,
  interval = 5000,
  heightClass = "h-[220px] sm:h-[300px]",
  className = "",
  overlay = "bg-black/45",
  children,
}: {
  images: { src: string; alt: string }[];
  interval?: number;
  heightClass?: string;
  className?: string;
  overlay?: string;
  children?: React.ReactNode;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % images.length), interval);
    return () => clearInterval(id);
  }, [images.length, interval]);

  return (
    <div className={`relative overflow-hidden ${heightClass} ${className}`}>
      {images.map((img, i) => (
        <div
          key={img.src}
          className={`absolute inset-0 transition-opacity duration-[1200ms] ease-in-out ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className={`w-full h-full will-change-transform ${i === index ? `animate-ken-burns${i % 3 === 1 ? "-2" : i % 3 === 2 ? "-3" : ""}` : ""}`}>
            <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
          </div>
        </div>
      ))}
      <div className={`absolute inset-0 ${overlay}`} />
      <div className="absolute inset-0 film-grain opacity-[0.03] pointer-events-none" />
      {children && <div className="absolute inset-0 z-10">{children}</div>}
      {/* Dots */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Imagen ${i + 1}`}
              className={`h-[3px] rounded-full transition-all duration-500 ${
                i === index ? "w-6 bg-white/80" : "w-3 bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
