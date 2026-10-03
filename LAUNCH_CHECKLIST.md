# Launch Checklist

What's still needed before Anny Bakes goes live. Tick items off as they're done.
Decisions already made are in [DECISIONS.md](DECISIONS.md).

_Last updated: 3 Oct 2026. Card and e-Transfer checkout both tested end to end._

## From the client

- [ ] **Canadian Stripe account (most important).** The current test keys belong to a Cyprus account ("Havitlabs", EUR). Live payments, CAD payouts and Interac Debit all need the client's own Canadian account.
- [ ] **Resend email setup.** Verify their domain in Resend, then set `RESEND_API_KEY`, `EMAIL_FROM` and `EMAIL_ADMIN`. Until then no confirmation or e-Transfer instruction emails are sent.
- [ ] **e-Transfer details.** Confirm `enjoy@annybakes.com` is registered at their bank to receive e-Transfers (ideally with Autodeposit), and that 24 hours to pay is right (`ETRANSFER_PAYMENT_HOURS`).
- [ ] **Pickup address** → `PICKUP_ADDRESS` in `constants/index.ts` (shown in emails).
- [ ] **Social handles** (Instagram, TikTok, YouTube) → `SOCIAL_LINKS` in `constants/index.ts`.
- [ ] **Contact email** → `CONTACT_EMAIL` in `constants/index.ts` (turns on "Contact Us" in the menu). Likely `enjoy@annybakes.com`.
- [ ] **Real phone number.** The T&Cs show a placeholder (613.000.0000), and cancellations must be made by phone.
- [ ] **Terms & Conditions answers** (questions sent; terms on hold for now):
  - Cancellation timing: counted from the Wednesday cutoff or from pickup, not from the drop opening?
  - Resend the garbled Cancellation and Order Modifications paragraphs.
  - Remove the "delivery assistant" wording from Pick-ups while it's pickup only?
  - Remove Last Minute Orders ("frozen") since the site says "never frozen"?
  - Gift cards / store credit handled by hand for now?
  - Remove catering words ("rentals", "proposals")?
- [ ] **Product content.** One-line descriptions and ingredients/allergens for all 28 items.
- [ ] **Confirm product names and prices**, e.g. "Bischoff" (Biscoff, a Lotus trademark), "Garnash" (ganache), "Trian Cheese", "Wheaton Melton", "Lemon coconut burger – JMB bun", "Honey chocolate jumbo"; shortbread at $22.40/$22.50 vs cookies at $5.20; cakes at $8.70–$11.70 (slice or whole?); focaccia "$9.50 × 2 per 1000g flat pan".
- [ ] **Domain.** Probably `annybakes.com` (from their email address).
- [ ] **Hosting choice.** Visitor analytics waits on this.

## Our side, at launch

- [ ] Switch to production keys: Stripe (client's account), Clerk (production instance on their domain) and Cloudinary.
- [ ] Point `MONGODB_URI` at the client's production database, then run `npm run db:seed` once.
- [ ] Create the Stripe webhook destination for the live domain (Snapshot payload; `checkout.session.completed` and `checkout.session.expired`) and set `STRIPE_WEBHOOK_SECRET`.
- [ ] Set `NEXT_PUBLIC_BASE_URL` to the live URL.
- [ ] MongoDB Atlas network access allows the host (`0.0.0.0/0` for Vercel).
- [ ] Add visitor analytics once the host is known.
- [ ] Finalise the legal pages from the client's wording (`data/legal.ts`; set `draft: false`) and add the Terms page.

## Later (not needed for launch)

- Automatic e-Transfer via a Request Money provider (e.g. VoPay, DCPayments) instead of marking payments received by hand.
- Interac Debit through Stripe (Apple Pay / Google Pay). Needs the Canadian Stripe account; enable by emailing debit-wallets-ca@stripe.com.
- Delivery (currently shown as "Coming soon").
