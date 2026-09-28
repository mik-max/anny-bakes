"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

// A clock that ticks every second. The server snapshot is null, so the first
// client render matches the server markup before the numbers appear.
function subscribe(onTick: () => void) {
  const timer = setInterval(onTick, 1000);
  return () => clearInterval(timer);
}
const getNow = () => Math.floor(Date.now() / 1000) * 1000;
const getServerNow = () => null;

/** Ticks down to `target`, then refreshes the page so the drop's new state shows. */
export default function Countdown({ target, label }: { target: string; label: string }) {
  const router = useRouter();
  const now = useSyncExternalStore(subscribe, getNow, getServerNow);
  const remainingMs = now === null ? null : Math.max(0, new Date(target).getTime() - now);

  useEffect(() => {
    if (remainingMs === 0) router.refresh();
  }, [remainingMs, router]);

  const total = remainingMs ?? 0;
  const parts = [
    { unit: "Day", value: Math.floor(total / 86_400_000) },
    { unit: "Hour", value: Math.floor(total / 3_600_000) % 24 },
    { unit: "Min", value: Math.floor(total / 60_000) % 60 },
    { unit: "Sec", value: Math.floor(total / 1_000) % 60 },
  ];

  return (
    <div className="text-center" role="timer" aria-live="off">
      <p className="mb-3 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
        {label}
      </p>
      <div className="flex justify-center gap-3 sm:gap-4">
        {parts.map(({ unit, value }) => (
          <div key={unit} className="w-16 rounded-xl bg-white py-3 shadow-sm sm:w-20">
            <p className="font-serif text-2xl text-stone-900 tabular-nums sm:text-3xl">
              {remainingMs === null ? "–" : String(value).padStart(2, "0")}
            </p>
            <p className="mt-0.5 font-sans text-[10px] uppercase tracking-widest text-stone-400">
              {/* "1 Day", but "0 Days" / "2 Days" */}
              {value === 1 ? unit : `${unit}s`}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
