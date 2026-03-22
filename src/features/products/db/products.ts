import { db } from "@/src";
import { ProductTable } from "@/src/drizzle/schema";
import { eq } from "drizzle-orm";

export async function insertProduct(
  data: Partial<typeof ProductTable.$inferInsert> & { courseIds: string[] },
) {}

export async function updateProduct(
  id: string,
  data: Partial<typeof ProductTable.$inferInsert> & { courseIds: string[] },
) {}

export async function deleteProduct(id: string) {
  const [deleteProduct] = await db
    .delete(ProductTable)
    .where(eq(ProductTable.id, id))
    .returning();
  if (deleteProduct == null) throw new Error("Faild to delete product");

  return deleteProduct;
}
