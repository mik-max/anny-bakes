"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import styles from "./FlourDust.module.css";

/** Seeded pseudo-random numbers, so server and client render the same specks. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
}

const rand = rng(42);
const round = (n: number) => Math.round(n * 100) / 100;
const SPECKS = Array.from({ length: 32 }, () => ({
  left: `${round(rand() * 100)}%`,
  "--s": `${round(1.5 + rand() * 2)}px`,
  "--o": round(0.25 + rand() * 0.45),
  "--sway": `${round((rand() - 0.5) * 6)}vw`,
  animationDuration: `${round(16 + rand() * 18)}s`,
  animationDelay: `${round(-rand() * 34)}s`, // negative: already mid-fall at first paint
}));

/** Faint flour drifting through the air over the hero photo. Pauses when scrolled away. */
export default function FlourDust() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) =>
      el.classList.toggle(styles.paused, !entry.isIntersecting)
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={styles.layer} aria-hidden="true">
      {SPECKS.map((style, i) => (
        <span key={i} className={styles.speck} style={style as CSSProperties} />
      ))}
    </div>
  );
}
