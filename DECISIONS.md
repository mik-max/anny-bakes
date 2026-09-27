# Client Decisions Log

Answers from the pre-launch questionnaire (received 27 Sep 2026). Target launch: **Thu 1 Oct 2026**.

## Decided

| Area | Decision |
|---|---|
| Hosting | Client handles production hosting. We just need the app working and deployable. |
| Database | **MongoDB.** Build against our test MongoDB; switch to the client's production database later. |
| Statement descriptor | `ANNY BAKES` |
| Payment | Pay **in full** at checkout (Stripe Checkout). |
| Timezone | Client said "Canadian time zone GMT+4". This is ambiguous; see *Needs clarification*. |
| Stock limits | Configurable count per item, per weekly drop. |
| Weekly drop model | Admin creates a weekly drop, adds products from the inventory (full catalogue), and sets a count for each item. **Only one drop can be active at a time.** |
| Custom orders | Out of scope for now. |
| Admin access | **Separate logins** per person (use Clerk, as specified in AGENTS.md). |
| Order notifications | Email only. |
| Visitor analytics | Yes. |
| Post-launch support | To be discussed when new features are needed. |

## Pending from client

- Web address (domain)
- Customer contact email
- Email address for new-order alerts
- Sales tax: required? prices tax-inclusive?
- Pickup address
- Pickup only, or delivery as well
- Cancellation / refund policy
- Policy for uncollected orders
- Privacy policy and disclaimer wording (in progress)

## Needs clarification

- **Menu size:** the rollout plan lists **28** items, not 30.
- **Timezone:** no Canadian timezone is GMT+4. The client most likely means UTC−4, which is currently either Eastern Daylight (Toronto) or Atlantic Standard (Halifax). We need the **city** so we can use the correct IANA zone and handle daylight saving. Clocks change on 1 Nov 2026.
- **Currency:** the codebase uses USD. A Canadian business will probably charge **CAD**.
- **Order window details** (when orders open, first pickup date, behaviour after the cutoff): these can be set per drop in the admin (opens at / closes at / pickup date), so they no longer block the build.
