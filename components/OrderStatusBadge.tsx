import { OrderStatus, PaymentMethod } from "@/types";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending:   "bg-stone-100 text-stone-600",
  expired:   "bg-stone-100 text-stone-400",
  paid:      "bg-blue-50 text-blue-700",
  preparing: "bg-amber-50 text-amber-700",
  ready:     "bg-emerald-50 text-emerald-700",
  fulfilled: "bg-stone-800 text-white",
  cancelled: "bg-red-50 text-red-600",
  refunded:  "bg-rose-50 text-rose-600",
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending:   "Pending",
  expired:   "Expired",
  paid:      "Paid",
  preparing: "Preparing",
  ready:     "Ready",
  fulfilled: "Fulfilled",
  cancelled: "Cancelled",
  refunded:  "Refunded",
};

export function OrderStatusBadge({
  status,
  paymentMethod,
}: {
  status: OrderStatus;
  paymentMethod?: PaymentMethod;
}) {
  const awaitingEtransfer = status === "pending" && paymentMethod === "etransfer";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 font-sans text-xs font-semibold",
        awaitingEtransfer ? "bg-amber-50 text-amber-700" : STATUS_STYLES[status]
      )}
    >
      {awaitingEtransfer ? "Awaiting e-Transfer" : STATUS_LABELS[status]}
    </span>
  );
}
