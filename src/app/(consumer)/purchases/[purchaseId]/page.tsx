import { db } from "@/src";
import { LoadingSpinner } from "@/src/components/LoadingSpinner";
import { PurchaseTable } from "@/src/drizzle/schema";
import { createdAt } from "@/src/drizzle/schemaHelper";
import { getCurrentUser } from "@/src/services/clerk";
import { stripeServerClient } from "@/src/services/stripe/stripeServer";
import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export default async function PurchasePage({
  params,
}: {
  params: Promise<{ purchaseId: string }>;
}) {
  const { purchaseId } = await params;

  return (
    <div className="conteiner my-6">
      <Suspense fallback={<LoadingSpinner className="size-34 mx-auto" />}>
        <SuspenseBoundary purchaseId={purchaseId} />
      </Suspense>
    </div>
  );
}

async function SuspenseBoundary({ purchaseId }: { purchaseId: string }) {
  const { userId, user, redirectToSignIn } = await getCurrentUser({
    allData: true,
  });

  if (userId == null || user == null) return redirectToSignIn();

  const purchase = await getPurchase({ userId, id: purchaseId });

  if (purchase == null) return notFound();

  const { receiptUrl, priceingRows } = await getStripeDetails(
    purchase.stripeSessionId,
    purchase.pricePaidInCents,
    purchase.refundedAt != null,
  );
}

async function getPurchase({ userId, id }: { userId: string; id: string }) {
  return await db.query.PurchaseTable.findFirst({
    columns: {
      pricePaidInCents: true,
      refundedAt: true,
      productDetails: true,
      createdAt: true,
      stripeSessionId: true,
    },
    where: and(eq(PurchaseTable.id, id), eq(PurchaseTable.userId, userId)),
  });
}

async function getStripeDetails(
  stripeSessionId: string,
  pricePaidInCents: number,
  isRefunded: boolen,
) {
  const { payment_intent, total_details, amount_total, amount_subtotal } =
    await stripeServerClient.checkout.sessions.reetrive(stripeSessionId, {
      expand: [
        "payment_intent.latest_charge",
        "total_details.breakdown.discounts",
      ],
    });
}
