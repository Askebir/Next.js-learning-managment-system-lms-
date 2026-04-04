import { db } from "@/src";
import { LoadingSpinner } from "@/src/components/LoadingSpinner";
import { PurchaseTable } from "@/src/drizzle/schema";
import { createdAt } from "@/src/drizzle/schemaHelper";
import { getCurrentUser } from "@/src/services/clerk";
import { stripeServerClient } from "@/src/services/stripe/stripeServer";
import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Stripe from "stripe";
import { Fragment, Suspense } from "react";
import PageHeader from "@/src/components/PageHeader";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { formatDate, formatPrice } from "@/src/lib/formatters";
import { cn } from "@/lib/utils";

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

  if (purchase == null) return notFound()

  const { receiptUrl, priceingRows } = await getStripeDetails(
    purchase.stripeSessionId,
    purchase.pricePaidInCents,
    purchase.refundedAt != null,
  );

  return (
    <>
      <PageHeader title={purchase.productDetails.name}>
        {receiptUrl && (
          <Button variant="outline" asChild>
            <Link target="blank" href={receiptUrl}>
              View Receipt
            </Link>
          </Button>
        )}
      </PageHeader>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-col gap-4">
              <CardTitle>Receipt</CardTitle>
              <CardDescription>ID:{purchaseId}</CardDescription>
            </div>
            <Badge>{purchase.refundedAt ? "refunded" : "Paid"}</Badge>
          </div>
        </CardHeader>
        <CardContent className="pb-4 grid grid-cols-2 gap-8 border-t pt-4">
          <div>
            <label className=" teext-sm text-muted-foreground">Date</label>
            <div>{formatDate(purchase.createdAt)}</div>
          </div>
          <div>
            <label className=" teext-sm text-muted-foreground">Product</label>
            <div>{purchase.productDetails.name}</div>
          </div>

          <div>
            <label className=" teext-sm text-muted-foreground">Customer</label>
            <div>{user.name}</div>
          </div>
          <div>
            <label className=" teext-sm text-muted-foreground">Seller</label>
            <div>Web Dev Simplified</div>
          </div>
        </CardContent>

        <CardFooter className="grid grid-cols-2 gap-y-4 gap-x-8 border-t pt-4">
          {priceingRows.map(({ label, amountInDollars, isBold }) => (
            <Fragment key={label}>
              <div className={cn(isBold && "font-bold")}>{label}</div>
              <div>
                {formatPrice(amountInDollars, { showZeroAsNumber: true })}
              </div>
            </Fragment>
          ))}
        </CardFooter>
      </Card>
    </>
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
    return [{ label: "Total", amountInDollars: total / 100, isBold: true }];
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
