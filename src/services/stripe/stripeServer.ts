import Stripe from "stripe";
export const stripeServerClient = new Stripe(process.env.STRIPE_SECTET_KEY!);
