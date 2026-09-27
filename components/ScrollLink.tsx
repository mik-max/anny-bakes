"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

// Remembers which section to scroll to after navigating to the home page.
const PENDING_KEY = "pending-scroll";

interface ScrollLinkProps {
  targetId: string;
  className?: string;
  children: ReactNode;
}

/** Scrolls to a home page section without putting a #hash in the URL. */
export default function ScrollLink({ targetId, className, children }: ScrollLinkProps) {
  const router = useRouter();

  const handleClick = () => {
    const target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
      return;
    }
    // The section is on the home page — go there and let PendingScroll finish.
    try {
      sessionStorage.setItem(PENDING_KEY, targetId);
    } catch {
      // Storage unavailable (e.g. private mode) — just land at the top.
    }
    router.push("/");
  };

  return (
    <button type="button" onClick={handleClick} className={className}>
      {children}
    </button>
  );
}

/** Rendered on the home page: completes a scroll requested from another page. */
export function PendingScroll() {
  useEffect(() => {
    let targetId: string | null = null;
    try {
      targetId = sessionStorage.getItem(PENDING_KEY);
      sessionStorage.removeItem(PENDING_KEY);
    } catch {
      return;
    }
    if (!targetId) return;

    // Wait a frame so Next's own scroll-to-top on navigation runs first.
    const frame = requestAnimationFrame(() =>
      document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" })
    );
    return () => cancelAnimationFrame(frame);
  }, []);

  return null;
}
