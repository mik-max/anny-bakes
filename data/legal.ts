// Content for the legal pages. Drafted from how the site actually works; items
// only the client can decide are marked `toConfirm` and shown as highlighted
// notes. Set `draft: false` (and `lastUpdated`) once the client approves a page.

export type LegalSlug = "privacy" | "refunds" | "disclaimer";

export interface LegalSection {
  heading: string;
  paragraphs: string[];
  /** Shown as a highlighted "To confirm" note until the client supplies it. */
  toConfirm?: string;
}

export interface LegalPage {
  slug: LegalSlug;
  title: string;
  /** Used for the page's meta description. */
  summary: string;
  draft: boolean;
  lastUpdated: string | null; // e.g. "October 1, 2026"
  intro: string;
  sections: LegalSection[];
}

export const LEGAL_PAGES: Record<LegalSlug, LegalPage> = {
  privacy: {
    slug: "privacy",
    title: "Privacy Policy",
    summary: "What information Anny Bakes collects when you order, and how it's used.",
    draft: true,
    lastUpdated: null,
    intro:
      "This policy explains what information Anny Bakes collects when you use this website and place an order, and how we use it.",
    sections: [
      {
        heading: "What we collect",
        paragraphs: [
          "When you place an order we collect your name, email address, phone number, any note you add to your order, the items you ordered and your pickup date.",
          "We don't offer customer accounts, so we don't store passwords or saved addresses.",
        ],
      },
      {
        heading: "Payments",
        paragraphs: [
          "Payments are processed securely by Stripe. Your card details go directly to Stripe — we never see or store your full card number. Stripe's own privacy policy is available at stripe.com/privacy.",
        ],
      },
      {
        heading: "How we use your information",
        paragraphs: [
          "We use your information to prepare your order, send your order confirmation, and contact you about your pickup if needed.",
          "We don't sell your information, and we don't send marketing emails.",
        ],
      },
      {
        heading: "Who we share it with",
        paragraphs: [
          "We share information only with the services that run this website: Stripe (payments), our email provider (order confirmations), and our hosting and database providers. They process it only to provide those services.",
        ],
      },
      {
        heading: "Information stored in your browser",
        paragraphs: [
          "Your cart is saved in your browser so it isn't lost if you refresh the page. It isn't sent to us until you check out.",
          "We don't use advertising or tracking cookies.",
        ],
        toConfirm: "If visitor analytics are added, this section needs to describe the analytics tool.",
      },
      {
        heading: "How long we keep your information",
        paragraphs: [
          "We keep order records for as long as we need them to run the bakery and meet our legal and accounting obligations.",
        ],
        toConfirm: "How long order records are kept (e.g. for tax and accounting purposes).",
      },
      {
        heading: "Your choices",
        paragraphs: [
          "You can ask us to see, correct or delete the personal information we hold about you by contacting us.",
        ],
        toConfirm: "The contact email for privacy requests.",
      },
    ],
  },

  refunds: {
    slug: "refunds",
    title: "Refund & Cancellation Policy",
    summary: "How cancellations, refunds and missed pickups work for Anny Bakes orders.",
    draft: true,
    lastUpdated: null,
    intro:
      "Every order is baked fresh for its weekly drop, so we plan and buy ingredients around the orders we receive.",
    sections: [
      {
        heading: "Cancelling an order",
        paragraphs: [],
        toConfirm:
          "Can customers cancel, and until when? (For example: full refund if cancelled before the Wednesday midday cutoff, no cancellations after.)",
      },
      {
        heading: "Refunds",
        paragraphs: ["Approved refunds are returned to the card used to pay."],
        toConfirm: "When refunds are offered, and roughly how long they take to appear.",
      },
      {
        heading: "Missed pickups",
        paragraphs: [],
        toConfirm:
          "What happens if an order isn't collected during the pickup window — is it held, donated, or refunded?",
      },
      {
        heading: "Problems with your order",
        paragraphs: [
          "If something isn't right with your order, please contact us with your order number and we'll do our best to make it right.",
        ],
        toConfirm: "The contact email for order problems.",
      },
    ],
  },

  disclaimer: {
    slug: "disclaimer",
    title: "Disclaimer",
    summary: "Allergen information and other important notes about Anny Bakes products.",
    draft: true,
    lastUpdated: null,
    intro: "Please read this before ordering, especially if you have food allergies.",
    sections: [
      {
        heading: "Allergens",
        paragraphs: [
          "Our bakes are made in a kitchen that handles common allergens. We can't guarantee that any item is free from them, even if they aren't listed as an ingredient.",
          "Ingredients are listed on each product where available. If you have a severe allergy, please contact us before ordering.",
        ],
        toConfirm:
          "The allergens the kitchen handles (e.g. wheat/gluten, dairy, eggs, tree nuts, peanuts, sesame, soy).",
      },
      {
        heading: "Health and nutrition",
        paragraphs: [
          "Descriptions of our products are for general information only and are not health, dietary or nutritional advice.",
        ],
      },
      {
        heading: "Product photos",
        paragraphs: [
          "Photos are for illustration. Every bake is made by hand, so size and appearance may vary.",
        ],
      },
      {
        heading: "Availability and prices",
        paragraphs: [
          "Weekly drop items are made in limited quantities. Products, prices and availability may change without notice.",
        ],
      },
    ],
  },
};
