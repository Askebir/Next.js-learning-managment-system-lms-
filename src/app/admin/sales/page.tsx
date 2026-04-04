import { db } from "@/src";
import PageHeader from "@/src/components/PageHeader";
import { PurchaseTable as DbPurchaseTable } from "@/src/drizzle/schema";
import { PurchaseTables } from "@/src/features/purchases/components/PurchaseTable";
import { desc } from "drizzle-orm";

export default async function PurchasesPage() {
  const purchases = await getPurchases();

  return (
    <div className="container my-6">
      <PageHeader title="Sales" />
      <PurchaseTables purchases={purchases} />
    </div>
  );
}

async function getPurchases() {
  return db.query.PurchaseTable.findMany({
    columns: {
      id: true,
      pricePaidInCents: true,
      refundedAt: true,
      productDetails: true,
      createdAt: true,
    },
    orderBy: desc(DbPurchaseTable.createdAt),
    with: { user: { columns: { name: true } } },
  });
}
