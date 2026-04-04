import { db } from "@/src";
import { PurchaseTable } from "@/src/drizzle/schema";
import { eq } from "drizzle-orm";

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

export async function updatePurchase(
  id: string,
  data: Partial<typeof PurchaseTable.$inferInsert>,
) {
  const details = data.productDetails;

  const [updatedPurchase] = await db
    .update(PurchaseTable)
    .set({
      ...data,
      productDetails: details
        ? {
            name: details.name,
            description: details.description,
            imageUrl: details.imageUrl,
          }
        : undefined,
    })
    .where(eq(PurchaseTable.id, id))
    .returning();

  if (updatedPurchase == null) throw new Error("Faild to update purchase");

  return updatedPurchase;
}
