# Client Decisions Log

Answers from the pre-launch questionnaire (received 27 Sep 2026). Target launch: **Thu 1 Oct 2026**.

## Decided

| Area | Decision |
|---|---|
| Hosting | Client handles production hosting. We just need the app working and deployable. |
| Database | **MongoDB.** Build against our test MongoDB; switch to the client's production database later. |
| Statement descriptor | `ANNY BAKES` |
| Payment | Pay **in full** at checkout: **card** (Stripe Checkout) or **Interac e-Transfer** (confirmed 3 Oct 2026). |
| e-Transfer | **Manual for launch:** customer sends to `enjoy@annybakes.com` with the order number; an admin marks it received; unpaid orders expire after 24h. **Automatic later** via a Request Money provider (e.g. VoPay, DCPayments) once the client has a merchant account. The Interac Hub link was identity verification, not payments. |
| Minimum order | **$22.00** (client's T&Cs), enforced in cart, checkout and server. |
| Currency | **CAD** (confirmed 3 Oct 2026). Prices unchanged, now in Canadian dollars. |
| Location / timezone | **Ottawa** (the client's T&Cs cite Ottawa Public Health), so `America/Toronto`, which the site already uses. |
| Sales tax | **None for now** (confirmed 28 Sep 2026). Prices are charged as listed. |
| Fulfilment | **Pickup only for now.** Checkout shows Delivery greyed out as "Coming soon" (confirmed 28 Sep 2026). |
| Stock limits | Configurable count per item, per weekly drop. |
| Weekly drop model | Admin creates a weekly drop, adds products from the inventory (full catalogue), and sets a count for each item. **Only one drop can be active at a time.** |
| Custom orders | Out of scope for now. |
| Admin access | **Separate logins** per person (use Clerk, as specified in AGENTS.md). |
| Order notifications | Email only. |
| Visitor analytics | Yes. |
| Post-launch support | To be discussed when new features are needed. |

## Home page structure (agreed 27 Sep 2026)

- **"Our Best Sellers" section becomes "Your Weekly Drops"**: a countdown timer (to open or close), drop items with an "X left" count, the "Order weekly drop" button, and the pre-order and pickup text.
- **"Our Full Menu" section becomes "Featured Best Sellers"**: products the admin marks as *featured*, followed by a "View full menu" button.
- **"View full menu"** links to a separate `/menu` page listing all products by category. Browsing only.
- **Only items in the open drop can be ordered.** Best sellers and the full menu are showcases; to make an item orderable, the admin adds it to a drop.
- **Drop states:** *open*, meaning orderable, with a countdown to the cutoff. *Scheduled*, meaning a preview with a countdown to opening. *None*, showing a "next drop coming soon" message. Admins can prepare upcoming drops in advance, but only one drop can be open at a time.

## Pending from client

See [LAUNCH_CHECKLIST.md](LAUNCH_CHECKLIST.md) for everything still needed before launch.

## Needs clarification

- **Menu size:** the rollout plan lists **28** items, not 30.
- **Order window details** (when orders open, first pickup date, behaviour after the cutoff): these can be set per drop in the admin (opens at / closes at / pickup date), so they no longer block the build.
