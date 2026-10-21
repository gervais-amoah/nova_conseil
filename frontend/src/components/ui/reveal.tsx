"use client";

import { useEffect, useRef } from "react";

type RevealProps = {
  children: React.ReactNode;
  delay?: number; // seconds
  className?: string;
};

export function Reveal({ children, delay = 0, className = "" }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return; // already on screen

    el.dataset.reveal = "hidden";
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.dataset.reveal = "shown";
        observer.disconnect();
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}s` }}
      className={`data-[reveal=hidden]:translate-y-6 data-[reveal=hidden]:opacity-0 data-[reveal=shown]:transition-[opacity,transform] data-[reveal=shown]:duration-700 data-[reveal=shown]:ease-out ${className}`}
    >
      {children}
    </div>
  );
}
