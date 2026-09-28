# Client Decisions Log

Answers from the pre-launch questionnaire (received 27 Sep 2026). Target launch: **Thu 1 Oct 2026**.

## Decided

| Area | Decision |
|---|---|
| Hosting | Client handles production hosting. We just need the app working and deployable. |
| Database | **MongoDB.** Build against our test MongoDB; switch to the client's production database later. |
| Statement descriptor | `ANNY BAKES` |
| Payment | Pay **in full** at checkout (Stripe Checkout). |
| Sales tax | **None for now** (confirmed 28 Sep 2026). Prices are charged as listed. |
| Fulfilment | **Pickup only for now.** Checkout shows Delivery greyed out as "Coming soon" (confirmed 28 Sep 2026). |
| Timezone | Client said "Canadian time zone GMT+4". This is ambiguous; see *Needs clarification*. |
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

- Web address (domain)
- Customer contact email
- Email address for new-order alerts
- Pickup address
- Cancellation / refund policy
- Policy for uncollected orders
- Privacy policy and disclaimer wording (in progress)

## Needs clarification

- **Menu size:** the rollout plan lists **28** items, not 30.
- **Timezone:** no Canadian timezone is GMT+4. The client most likely means UTC−4, which is currently either Eastern Daylight (Toronto) or Atlantic Standard (Halifax). We need the **city** so we can use the correct IANA zone and handle daylight saving. Clocks change on 1 Nov 2026.
- **Currency:** the codebase uses USD. A Canadian business will probably charge **CAD**.
- **Order window details** (when orders open, first pickup date, behaviour after the cutoff): these can be set per drop in the admin (opens at / closes at / pickup date), so they no longer block the build.
