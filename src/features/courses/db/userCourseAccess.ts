import { db } from "@/src";
import {
  ProductTable,
  PurchaseTable,
  UserCourseAccessTable,
} from "@/src/drizzle/schema";
import { and, eq, inArray, isNull } from "drizzle-orm";

export async function addUserCourseAccess({
  userId,
  courseIds,
}: {
  userId: string;
  courseIds: string[];
}) {
  const accesses = await db
    .insert(UserCourseAccessTable)
    .values(courseIds.map((courseId) => ({ userId, courseId })))
    .returning();

  return accesses;
}

export async function revokeUserCourseAccess({
  userId,
  productId,
}: {
  userId: string;
  productId: string;
}) {
  const validPurchases = await db.query.PurchaseTable.findMany({
    where: and(
      eq(PurchaseTable.userId, userId),
      isNull(PurchaseTable.refundedAt),
    ),
    with: {
      product: {
        with: { courseProducts: { columns: { courseId: true } } },
      },
    },
  });

  const refundPurchase = await db.query.ProductTable.findFirst({
    where: eq(ProductTable.id, productId),
    with: { courseProducts: { columns: { courseId: true } } },
  });

  if (refundPurchase == null) return;

  const validCourseIds = validPurchases.flatMap((p) =>
    p.product.courseProducts.map((cp) => cp.courseId),
  );

  const removeCourseIds = refundPurchase.courseProducts
    .flatMap((cp) => cp.courseId)
    .filter((courseId) => !validCourseIds.includes(courseId));

  const revokedAccesses = await db
    .delete(UserCourseAccessTable)
    .where(
      and(
        eq(UserCourseAccessTable.userId, userId),
        inArray(UserCourseAccessTable.courseId, removeCourseIds),
      ),
    )
    .returning();

  return revokedAccesses;
}
