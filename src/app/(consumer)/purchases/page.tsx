import { Button } from "@/components/ui/button";
import { db } from "@/src";
import PageHeader from "@/src/components/PageHeader";
import { PurchaseTable } from "@/src/drizzle/schema";
import {
  UserPurchaseTable,
  UserPurchaseTableSkeleton,
} from "@/src/features/purchases/components/UserPurchaseTable";
import { getCurrentUser } from "@/src/services/clerk";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { Suspense } from "react";

export default function PurchasesPage() {
  return (
    <div>
      <PageHeader title="Purchase History" />
      <Suspense fallback={<UserPurchaseTableSkeleton />}>
        <SuspenseBoundary />
      </Suspense>
    </div>
  );
}

async function SuspenseBoundary() {
  const { userId, redirectToSignIn } = await getCurrentUser();
  if (userId == null) return redirectToSignIn();

  const purchase = await getPurchase(userId);

  if (purchase.length === 0) {
    return (
      <div className="flex flex-col gap-2 items-start">
        You have made no purchase yet
        <Button asChild size="lg">
          <Link href="/">Browse Course</Link>
        </Button>
      </div>
    );
  }

  return <UserPurchaseTable purchases={purchase} />;
}

async function getPurchase(userId: string) {
  return db.query.PurchaseTable.findMany({
    columns: {
      id: true,
      pricePaidInCents: true,
      refundedAt: true,
      productDetails: true,
      createdAt: true,
    },
    where: eq(PurchaseTable.userId, userId),
    orderBy: desc(PurchaseTable.createdAt),
  });
}
