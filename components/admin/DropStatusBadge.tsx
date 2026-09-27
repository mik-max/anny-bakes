import type { DropStatus } from "@/types";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<DropStatus, string> = {
  scheduled: "bg-blue-50 text-blue-700",
  open: "bg-emerald-50 text-emerald-700",
  closed: "bg-stone-100 text-stone-500",
};

const STATUS_LABELS: Record<DropStatus, string> = {
  scheduled: "Scheduled",
  open: "Open",
  closed: "Closed",
};

export function DropStatusBadge({ status }: { status: DropStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 font-sans text-xs font-semibold",
        STATUS_STYLES[status]
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
