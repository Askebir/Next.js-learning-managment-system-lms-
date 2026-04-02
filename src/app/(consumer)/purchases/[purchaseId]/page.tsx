import { db } from "@/src";
import { LoadingSpinner } from "@/src/components/LoadingSpinner";
import { PurchaseTable } from "@/src/drizzle/schema";
import { createdAt } from "@/src/drizzle/schemaHelper";
import { getCurrentUser } from "@/src/services/clerk";
import { stripeServerClient } from "@/src/services/stripe/stripeServer";
import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Stripe from "stripe";
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
  isRefunded: boolean,
) {
  const { payment_intent, total_details, amount_total, amount_subtotal } =
    await stripeServerClient.checkout.sessions.retrieve(stripeSessionId, {
      expand: [
        "payment_intent.latest_charge",
        "total_details.breakdown.discounts",
      ],
    });

  const refundedAmount =
    typeof payment_intent !== "string" &&
    typeof payment_intent?.latest_charge !== "string"
      ? payment_intent?.latest_charge?.amount_refunded
      : isRefunded
        ? pricePaidInCents
        : undefined;

  return {
    receiptUrl: getReceiptUrl(payment_intent),
    priceingRows: getPriceingRows(total_details, {
      total: (amount_total ?? pricePaidInCents) - (refundedAmount ?? 0),
      subtotal: amount_subtotal ?? pricePaidInCents,
      refund: refundedAmount,
    }),
  };
}

function getReceiptUrl(paymentIntent: Stripe.PaymentIntent | string | null) {
  if (
    typeof paymentIntent === "string" ||
    typeof paymentIntent?.latest_charge === "string"
  ) {
    return;
  }

  return paymentIntent?.latest_charge?.receipt_url;
}

function getPriceingRows(
  totalDetails: Stripe.Checkout.Session.TotalDetails | null,
  {
    total,
    subtotal,
    refund,
  }: {
    total: number;
    subtotal: number;
    refund?: number;
  },
) {
  const priceingRows: {
    label: string;
    amountInDollars: number;
    isBold?: boolean;
  }[] = [];

  if (totalDetails?.breakdown != null) {
    totalDetails.breakdown.discounts.forEach((discount: any) => {
      priceingRows.push({
        label: `${discount.discount.coupon.name}(${discount.discount.coupon.pricent_off}% off)`,
        amountInDollars: discount.amount / -100,
      });
    });
  }

  if (refund) {
    priceingRows.push({
      label: "Refund",
      amountInDollars: refund / -100,
    });
  }

  if (priceingRows.length === 0) {
    return [{ lable: "Total", amountInDollars: total / 100, isBold: true }];
  }

  return [
    {
      label: "Subtotal",
      amountInDollars: subtotal / 100,
    },
    ...priceingRows,
    {
      label: "Total",
      amountInDollars: total / 100,
      isBold: true,
    },
  ];
}
