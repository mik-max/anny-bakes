import "server-only";
import { sendEmail } from "@/backend/email";
import { CURRENCY_SYMBOL, PICKUP_ADDRESS } from "@/constants";
import { formatPickupDate } from "@/lib/time";
import type { Order } from "@/types";

// Plain, inline-styled HTML — email clients ignore stylesheets.

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const money = (cents: number) => `${CURRENCY_SYMBOL}${(cents / 100).toFixed(2)}`;

function pickupText(order: Order): string {
  const when = `${formatPickupDate(order.pickup_date)}, ${order.pickup_window}`;
  return PICKUP_ADDRESS ? `${when} at ${PICKUP_ADDRESS}` : when;
}

function itemsHtml(order: Order): string {
  const rows = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding:6px 0;color:#44403c">${escapeHtml(item.product_name)} × ${item.quantity}</td>
          <td style="padding:6px 0;color:#1c1917;text-align:right">${money(item.unit_price * item.quantity)}</td>
        </tr>`
    )
    .join("");
  return `
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      ${rows}
      <tr>
        <td style="padding:10px 0 0;border-top:1px solid #e7e5e4;font-weight:600">Total</td>
        <td style="padding:10px 0 0;border-top:1px solid #e7e5e4;font-weight:600;text-align:right">${money(order.total)}</td>
      </tr>
    </table>`;
}

function itemsText(order: Order): string {
  const lines = order.items.map(
    (item) => `- ${item.product_name} × ${item.quantity}: ${money(item.unit_price * item.quantity)}`
  );
  return [...lines, `Total: ${money(order.total)}`].join("\n");
}

function layout(body: string): string {
  return `<!doctype html>
<html>
  <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
  <body style="margin:0">
    <div style="background:#faf6f0;padding:32px 16px;font-family:Helvetica,Arial,sans-serif">
      <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px">
        <p style="margin:0 0 24px;font-family:Georgia,serif;font-size:24px;color:#1c1917">Anny Bakes</p>
        ${body}
      </div>
    </div>
  </body>
</html>`;
}

export function customerConfirmationEmail(order: Order) {
  const subject = `Your Anny Bakes order ${order.order_number} is confirmed`;
  const html = layout(`
    <h1 style="margin:0 0 8px;font-size:20px;color:#1c1917">Thank you, ${escapeHtml(order.customer_name)}!</h1>
    <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#57534e">
      We've received your payment for order <strong>${order.order_number}</strong> and will bake it fresh for you.
    </p>
    <div style="margin:0 0 20px;padding:16px;background:#faf6f0;border-radius:12px;font-size:14px;color:#1c1917">
      <strong>Pickup:</strong> ${escapeHtml(pickupText(order))}
    </div>
    ${itemsHtml(order)}
    <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#78716c">
      Questions about your order? Just reply to this email.
    </p>`);
  const text = [
    `Thank you, ${order.customer_name}!`,
    `We've received your payment for order ${order.order_number} and will bake it fresh for you.`,
    "",
    `Pickup: ${pickupText(order)}`,
    "",
    itemsText(order),
    "",
    "Questions about your order? Just reply to this email.",
  ].join("\n");
  return { subject, html, text };
}

export function bakeryNewOrderEmail(order: Order) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const adminUrl = baseUrl ? `${baseUrl}/admin/orders/${order.id}` : null;
  const subject = `New order ${order.order_number} — ${money(order.total)} for ${formatPickupDate(order.pickup_date)}`;
  const html = layout(`
    <h1 style="margin:0 0 16px;font-size:20px;color:#1c1917">New order ${order.order_number}</h1>
    <p style="margin:0 0 4px;font-size:14px;color:#1c1917"><strong>${escapeHtml(order.customer_name)}</strong></p>
    <p style="margin:0 0 16px;font-size:14px;color:#57534e">${escapeHtml(order.email)} · ${escapeHtml(order.phone)}</p>
    <p style="margin:0 0 16px;font-size:14px;color:#1c1917"><strong>Pickup:</strong> ${escapeHtml(pickupText(order))}</p>
    ${
      order.note
        ? `<div style="margin:0 0 16px;padding:12px 16px;background:#fffbeb;border-radius:12px;font-size:14px;color:#78350f"><strong>Note:</strong> ${escapeHtml(order.note)}</div>`
        : ""
    }
    ${itemsHtml(order)}
    ${
      adminUrl
        ? `<p style="margin:24px 0 0"><a href="${adminUrl}" style="display:inline-block;background:#1c1917;color:#ffffff;padding:10px 18px;border-radius:8px;font-size:14px;text-decoration:none">View in admin</a></p>`
        : ""
    }`);
  const text = [
    `New order ${order.order_number}`,
    `${order.customer_name} — ${order.email} · ${order.phone}`,
    `Pickup: ${pickupText(order)}`,
    ...(order.note ? [`Note: ${order.note}`] : []),
    "",
    itemsText(order),
    ...(adminUrl ? ["", `View in admin: ${adminUrl}`] : []),
  ].join("\n");
  return { subject, html, text };
}

/** Customer receipt + bakery alert. Call once, when an order first becomes paid. */
export async function sendOrderPaidEmails(order: Order): Promise<void> {
  const bakeryInbox = process.env.EMAIL_ADMIN;

  await Promise.all([
    sendEmail({
      to: order.email,
      ...customerConfirmationEmail(order),
      replyTo: bakeryInbox,
      idempotencyKey: `order-confirmation/${order.id}`,
    }),
    bakeryInbox
      ? sendEmail({
          to: bakeryInbox,
          ...bakeryNewOrderEmail(order),
          replyTo: order.email,
          idempotencyKey: `order-alert/${order.id}`,
        })
      : Promise.resolve(console.info("[email] skipped bakery alert: EMAIL_ADMIN not set")),
  ]);
}
