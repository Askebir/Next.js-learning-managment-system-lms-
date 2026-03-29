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

export async function POST() {}

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

  db.transaction(async (trx: any) => {
    try {
      await addUserCourseAccess({ userId: user.id, courseIds }, trx);
      await insertPurchase(
        {
          stripeSessionId: checkoutSession.id,
          pricePaidInCents:
            checkoutSession.amount_total || product.priceInDollars * 100,
          productDetails: product,
          userId: user.id,
          productId,
        },
        trx,
      );
    } catch (error) {
      trx.rollback();
      throw error;
    }
  });

  return productId;
}

async function getProduct(id: string) {
  return await db.query.ProductTable.findFirst({
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

async function getUser(id: string) {
  return await db.query.UserTable.findFirst({
    columns: { id: true },
    where: eq(UserTable.id, id),
  });
}
