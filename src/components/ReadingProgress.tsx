"use client";

import { useEffect, useState } from "react";

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable > 0) {
        setProgress((window.scrollY / scrollable) * 100);
      }
    };
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  if (progress <= 0) return null;

  return (
    <div className="fixed top-14 left-0 right-0 z-40 h-[2px] bg-neutral-200 dark:bg-neutral-800">
      <div
        className="h-full bg-bitcoin transition-[width] duration-100 ease-out"
        style={{ width: `${Math.min(progress, 100)}%` }}
      />
    </div>
  );
}
