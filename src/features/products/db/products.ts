import { db } from "@/src";
import {
  CourseProductTable,
  ProductTable,
  PurchaseTable,
} from "@/src/drizzle/schema";
import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function userOwnsProduct({
  userId,
  productId,
}: {
  userId: string;
  productId: string;
}) {
  const existingPurcase = await db.query.PurchaseTable.findFirst({
    where: and(
      eq(PurchaseTable.productId, productId),
      eq(PurchaseTable.userId, userId),
      isNull(PurchaseTable.refundedAt),
    ),
  });

  return existingPurcase != null;
}

// Insert Product
export async function insertProduct(
  data: typeof ProductTable.$inferInsert & { courseIds?: string[] },
) {
  try {
    const { courseIds = [], ...productData } = data;

    // Insert product
    const [newProduct] = await db
      .insert(ProductTable)
      .values(productData)
      .returning();

    if (!newProduct) throw new Error("Failed to create product");

    // Insert relations if any
    if (courseIds.length > 0) {
      await db
        .insert(CourseProductTable)
        .values(
          courseIds.map((courseId) => ({ productId: newProduct.id, courseId })),
        );
    }

    // Revalidate cache
    revalidatePath("/admin/products");

    return newProduct;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Update Product
export async function updateProduct(
  id: string,
  data: Partial<typeof ProductTable.$inferInsert> & { courseIds?: string[] },
) {
  try {
    const { courseIds = [], ...productData } = data;

    const [updatedProduct] = await db
      .update(ProductTable)
      .set(productData)
      .where(eq(ProductTable.id, id))
      .returning();

    if (!updatedProduct) throw new Error("Failed to update product");

    // Remove old relations
    await db
      .delete(CourseProductTable)
      .where(eq(CourseProductTable.productId, updatedProduct.id));

    // Insert new relations
    if (courseIds.length > 0) {
      await db.insert(CourseProductTable).values(
        courseIds.map((courseId) => ({
          productId: updatedProduct.id,
          courseId,
        })),
      );
    }

    revalidatePath("/admin/products");

    return updatedProduct;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function deleteProduct(id: string) {
  const [deleteProduct] = await db
    .delete(ProductTable)
    .where(eq(ProductTable.id, id))
    .returning();
  if (deleteProduct == null) throw new Error("Faild to delete product");

  return deleteProduct;
}
