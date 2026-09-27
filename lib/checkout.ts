/**
 * sessionStorage key for the Stripe session the customer was just sent to.
 * Checkout cancels it on return (releasing held stock); the success page clears it.
 */
export const PENDING_CHECKOUT_KEY = "pending-checkout-session";

export const STRIPE_SESSION_ID = /^cs_(test|live)_[A-Za-z0-9]+$/;
