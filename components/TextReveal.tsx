"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(SplitText, ScrollTrigger);

interface Props {
  children: React.ReactNode;
  className?: string;
  /** Stagger delay between each split unit in seconds */
  stagger?: number;
  /** Additional delay before the animation starts */
  delay?: number;
  /** Split and animate by "words" or "lines" */
  by?: "words" | "lines";
  /** "mount" fires immediately; "scroll" fires when element enters viewport */
  trigger?: "mount" | "scroll";
}

export default function TextReveal({
  children,
  className,
  stagger,
  delay = 0,
  by = "words",
  trigger = "scroll",
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const split = new SplitText(el, { type: by, mask: by });
      const targets = by === "lines" ? split.lines : split.words;

      const vars: gsap.TweenVars = {
        yPercent: 110,
        duration: 0.75,
        stagger: stagger ?? (by === "lines" ? 0.16 : 0.13),
        delay,
        ease: "power3.out",
      };

      if (trigger === "scroll") {
        vars.scrollTrigger = {
          trigger: el,
          start: "top 88%",
          once: true,
        };
      }

      gsap.from(targets, vars);
    }, el);

    return () => ctx.revert();
  }, [by, delay, stagger, trigger]);

  return (
    <span ref={ref} className={className}>
      {children}
    </span>
  );
}
