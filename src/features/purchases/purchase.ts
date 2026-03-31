import { db } from "@/src";
import { PurchaseTable } from "@/src/drizzle/schema";

export async function insertPurchase(data: typeof PurchaseTable.$inferInsert) {
  const details = data.productDetails;

  const [newPurchase] = await db
    .insert(PurchaseTable)
    .values({
      ...data,
      productDetails: {
        name: details.name,
        description: details.description,
        imageUrl: details.imageUrl,
      },
    })
    .onConflictDoNothing()
    .returning();

  return newPurchase;
}
