import { db } from "@/src";
import { ProductTable, UserTable } from "@/src/drizzle/schema";
import { addUserCourseAccess } from "@/src/features/courses/db/userCourseAccess";
import { insertPurchase } from "@/src/features/purchases/purchase";
import { stripeServerClient } from "@/src/services/stripe/stripeServer";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function GET(request: NextRequest) {
  const stripeSessionId = request.nextUrl.searchParams.get("stripeSessionId");
  if (stripeSessionId == null) redirect("/products/parchase-failure");

  let redirectUrl: string;
  try {
    const checkoutSession = await stripeServerClient.checkout.sessions.retrieve(
      stripeSessionId,
      { expand: ["line_items"] },
    );
    const productId = await processStripeCheckout(checkoutSession);
    redirectUrl = `/products/${productId}/purchase/success`;
  } catch {
    redirectUrl = "/products/acehprsu - failure";
  }

  return NextResponse.redirect(new URL(redirectUrl, request.url));
}

export async function POST(request: NextRequest) {
  const event = await stripeServerClient.webhooks.constructEvent(
    await request.text(),
    request.headers.get("stripe-signature") as string,
    process.env.STRIPE_WEBHOOK_SECRET!,
  );

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      try {
        await processStripeCheckout(event.data.object);
      } catch {
        return new Response(null, { status: 500 });
      }
    }
  }
  return new Response(null, { status: 200 });
}

async function processStripeCheckout(checkoutSession: Stripe.Checkout.Session) {
  const userId = checkoutSession.metadata?.userId;
  const productId = checkoutSession.metadata?.productId;

  if (userId == null || productId == null) {
    throw new Error("Messing metadata");
  }

  const [product, user] = await Promise.all([
    getProduct(productId),
    await getUser(userId),
  ]);
  if (product == null) throw new Error("Product not found");
  if (user == null) throw new Error("Product not found");

  const courseIds = product.courseProducts.map(
    (cp: { courseId: string }) => cp.courseId,
  );

  try {
    await addUserCourseAccess({ userId: user.id, courseIds });
    await insertPurchase({
      stripeSessionId: checkoutSession.id,
      pricePaidInCents:
        checkoutSession.amount_total || product.priceInDollars * 100,
      productDetails: product,
      userId: user.id,
      productId,
    });
  } catch (error) {
    throw error;
  }

  return productId;
}

function getProduct(id: string) {
  return db.query.ProductTable.findFirst({
    columns: {
      id: true,
      priceInDollars: true,
      name: true,
      description: true,
      imageUrl: true,
    },
    where: eq(ProductTable.id, id),
    with: {
      courseProducts: { columns: { courseId: true } },
    },
  });
}

function getUser(id: string) {
  return db.query.UserTable.findFirst({
    columns: { id: true },
    where: eq(UserTable.id, id),
  });
}
