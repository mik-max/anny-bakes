PRD — Simple Baking Storefront
Document status: Draft v1
Last updated: 15 June 2026


1. Summary
A lightweight web storefront for a bakery. Visitors land directly on a catalogue of cakes and confectionaries, add items to a cart, and check out and pay via Stripe — no account or registration required. A minimal password-protected admin page lets the bakery view and manage incoming orders.
The guiding principle is simplicity: the smallest thing that lets a customer buy a cake and lets the baker fulfil it.
2. Goals & non-goals
Goals
Let anyone buy a product in under a minute, with zero friction (no sign-up).
Take real payments reliably through Stripe.
Give the bakery a single screen to see new orders and move them through fulfilment.
Non-goals (explicitly out of scope for v1)
Customer accounts, login, saved addresses, or order history for buyers.
Loyalty, discounts, coupons, gift cards.
Inventory automation beyond a simple in-stock / out-of-stock flag.
Delivery logistics / courier integration (collect delivery details only).
Multi-vendor or multi-location support.
Email marketing, reviews, ratings.
3. Target users
User
Need
Customer (guest)
Browse products, buy quickly, pay securely, get confirmation.
Bakery admin
See orders as they arrive, mark them paid/preparing/ready/fulfilled, view contact + delivery details.

4. Key assumptions
These are reasonable defaults; flag any you want changed.
Payment provider: Stripe (as requested). Currency is a single configurable value (e.g. USD/GBP).
Fulfilment: Both pickup and delivery offered; customer chooses at checkout. Delivery is a flat fee or free above a threshold (configurable).
Catalogue size: Small (tens of products, not thousands) — no search/filtering needed in v1.
Single bakery, single admin credential.
5. User stories
Customer
As a visitor, I land on the page and immediately see what's for sale, with photos and prices.
As a customer, I can add items to a cart and adjust quantities.
As a customer, I can check out by entering only contact + fulfilment details and paying by card.
As a customer, I receive an on-screen and email confirmation with my order number.
Admin
As the admin, I log in with a single credential and see all orders, newest first.
As the admin, I can open an order to see items, totals, customer contact, and delivery/pickup choice.
As the admin, I can change an order's status and see only paid orders by default.
As the admin, I can mark a product out of stock so it can't be ordered.
6. Functional requirements
6.1 Storefront (landing = catalogue)
The root URL renders the product list directly — no splash, no intermediate home page.
Each product card shows: image, name, short description, price, and an Add to cart button.
Out-of-stock products are shown but greyed out and un-addable (or hidden — configurable).
A persistent cart indicator (item count + subtotal) is visible; clicking it opens the cart.
Cart is client-side and survives page refresh (local storage); no login tied to it.
6.2 Cart
View line items, change quantity, remove items, see running subtotal.
Proceed to checkout button.
6.3 Checkout
Collect: full name, email, phone, fulfilment method (pickup / delivery). If delivery: address. Optional order note (e.g. cake message).
Show order summary: line items, delivery fee (if any), total.
Payment via Stripe Checkout (hosted) or Stripe Payment Element (embedded). Recommend hosted Stripe Checkout for v1 — least code, PCI handled by Stripe, supports cards + wallets.
On successful payment, create the order record and show a confirmation page with the order number.
Send a confirmation email to the customer and a notification email to the bakery.
6.4 Payment & order integrity
The server creates the Stripe session/intent with prices looked up server-side from the product records — never trust amounts sent by the client.
An order is only marked paid when Stripe confirms it, via webhook (checkout.session.completed / payment_intent.succeeded), not on client redirect alone.
Handle the case where the customer closes the tab after paying: the webhook is the source of truth.
6.5 Admin
Protected route (single shared password or simple admin auth — no public sign-up).
Order list: order number, customer name, total, status, timestamp; sortable/filterable by status.
Order detail: full line items, contact details, fulfilment choice/address, note, Stripe payment reference.
Status transitions: Paid → Preparing → Ready → Fulfilled (plus Cancelled/Refunded).
Simple product management: add/edit product (name, description, price, image, in-stock toggle).
7. Order lifecycle
[Pending payment] --stripe webhook--> [Paid] --> [Preparing] --> [Ready] --> [Fulfilled]
       |                                  |
       +--abandoned (no webhook)          +--> [Cancelled / Refunded]
Pending payment: checkout started, awaiting Stripe confirmation.
Paid: webhook confirmed; this is what the admin acts on.
Remaining statuses are manual transitions by the admin.
8. Data model (minimal)
Product
id, name, description, price (minor units, e.g. cents), image_url, in_stock (bool), created_at
Order
id, order_number (human-friendly), customer_name, email, phone, fulfilment_method (pickup|delivery), delivery_address (nullable), note (nullable), subtotal, delivery_fee, total, currency, status, stripe_session_id, stripe_payment_intent, created_at, updated_at
OrderItem
id, order_id, product_id, product_name (snapshot), unit_price (snapshot), quantity
Prices and names are snapshotted onto the order so later product edits don't rewrite history.
9. Non-functional requirements
Performance: catalogue loads fast; product images optimised/lazy-loaded.
Security: no card data ever touches the server (Stripe handles it); admin route is auth-gated; Stripe webhook signature verified.
Reliability: webhook handler is idempotent (a duplicate event must not create a duplicate order or double-charge state).
Mobile-first: most buyers will be on phones; the catalogue and checkout must be fully responsive.
Accessibility: semantic markup, alt text on product images, keyboard-navigable cart/checkout.
10. Suggested tech (lightweight, illustrative)
Kept deliberately simple; substitute to taste.
Frontend: any modern framework (Next.js / Astro / SvelteKit) or even a single SPA. Catalogue is static-ish; cart is client state.
Backend: thin API for creating Stripe sessions, handling webhooks, and serving/storing orders. Serverless functions are a good fit.
Database: a small managed Postgres or even SQLite for a single bakery.
Payments: Stripe Checkout (hosted) + webhooks.
Email: a transactional provider (Resend/Postmark/SES) for confirmations.
Admin auth: single credential via env var or a one-row admins table; no public registration.
11. Success metrics
Checkout completion rate (carts that reach a paid order).
Time from landing to paid order.
Payment success rate (Stripe).
Orders fulfilled without manual intervention / errors.
12. Open questions
Pickup only, delivery only, or both? (assumed both)
Single currency — which one?
Should out-of-stock items be hidden or shown greyed out?
Do you need a "cake message / customisation" field beyond a free-text note?
One admin user, or a couple of staff logins?
Any lead-time concept (e.g. "order 48h in advance for custom cakes")?
