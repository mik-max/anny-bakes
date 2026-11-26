"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

// A clock that ticks every second. The server snapshot is null, so the first
// client render matches the server markup before the numbers appear.
function subscribe(onTick: () => void) {
  const timer = setInterval(onTick, 1000);
  return () => clearInterval(timer);
}
const getNow = () => Math.floor(Date.now() / 1000) * 1000;
const getServerNow = () => null;

const UNITS = ["Day", "Hour", "Min", "Sec"] as const;

/** Days / hours / minutes / seconds in `ms`, each as two digits. */
function split(ms: number) {
  return [
    Math.floor(ms / 86_400_000),
    Math.floor(ms / 3_600_000) % 24,
    Math.floor(ms / 60_000) % 60,
    Math.floor(ms / 1_000) % 60,
  ].map((value) => ({ value, digits: String(value).padStart(2, "0") }));
}

/**
 * One digit in a one-line window. When it differs from a second ago, the old digit
 * rolls down and out while the new one rolls in from above, like an odometer.
 * Keys change only when the digit does, so unchanged digits never re-animate.
 */
function RollingDigit({ digit, previous }: { digit: string; previous: string }) {
  const changed = digit !== previous;
  return (
    <span className="relative inline-block overflow-hidden align-top">
      {changed && (
        <span
          key={`out-${previous}`}
          aria-hidden
          className="absolute inset-x-0 top-0 motion-safe:animate-[digit-out_0.5s_cubic-bezier(0.65,0,0.35,1)_both] motion-reduce:hidden"
        >
          {previous}
        </span>
      )}
      <span
        key={`in-${digit}`}
        className={cn("block", changed && "motion-safe:animate-[digit-in_0.5s_cubic-bezier(0.65,0,0.35,1)_both]")}
      >
        {digit}
      </span>
    </span>
  );
}

/** Ticks down to `target`, then refreshes the page so the drop's new state shows. */
export default function Countdown({ target, label }: { target: string; label: string }) {
  const router = useRouter();
  const now = useSyncExternalStore(subscribe, getNow, getServerNow);
  const remainingMs = now === null ? null : Math.max(0, new Date(target).getTime() - now);

  useEffect(() => {
    if (remainingMs === 0) router.refresh();
  }, [remainingMs, router]);

  const total = remainingMs ?? 0;
  const parts = split(total);
  const before = split(total + 1000); // what the clock showed a second ago

  return (
    <div className="text-center" role="timer" aria-live="off">
      <p className="mb-3 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
        {label}
      </p>
      <div className="flex justify-center gap-3 sm:gap-4">
        {parts.map(({ value, digits }, i) => (
          <div key={UNITS[i]} className="w-16 rounded-xl bg-white py-3 shadow-sm sm:w-20">
            <p className="font-sans text-2xl font-semibold text-stone-900 tabular-nums sm:text-3xl">
              {remainingMs === null
                ? "–"
                : digits
                    .split("")
                    .map((digit, d) => (
                      <RollingDigit key={d} digit={digit} previous={before[i].digits[d]} />
                    ))}
            </p>
            <p className="mt-0.5 font-sans text-[10px] uppercase tracking-widest text-stone-400">
              {/* "1 Day", but "0 Days" / "2 Days" */}
              {value === 1 ? UNITS[i] : `${UNITS[i]}s`}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
