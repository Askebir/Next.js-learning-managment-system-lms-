import { db } from "@/src";
import PageHeader from "@/src/components/PageHeader";
import { Button } from "@/src/components/ui/button";
import { CourseTable } from "@/src/features/courses/components/CourseTable";
import { getCourseGlobalTag } from "@/src/features/courses/db/cache/courses";
import {
  CourseProductTable,
  CourseSectionTable,
  CourseTable as DbCourseTable,
  LessonTable,
  PurchaseTable,
  UserCourseAccessTable,
} from "@/src/drizzle/schema";

import { ProductTable as DbProductTable } from "@/src/drizzle/schema";

import Link from "next/link";
import { asc, countDistinct, eq } from "drizzle-orm";

import { getUserCourseAccessGlobalTag } from "@/src/features/courses/db/cache/userCourseAccess";
import { getUserCourseSectionGlobalTag } from "@/src/features/courseSections/db/cache";
import { getLessonGlobalTag } from "@/src/features/lessons/db/cache/cache";

export default async function ProdcutsPage() {
  const products = await getProducts();

  return (
    <div className="container mx-3 my-6">
      <PageHeader title="Products">
        <Button asChild>
          <Link href="/admin/products/new">New Product</Link>
        </Button>
      </PageHeader>

      <ProductTable prodcuts={products} />
    </div>
  );
}

async function getProducts() {
  return db
    .select({
      id: DbProductTable.id,
      name: DbProductTable.name,
      status: DbProductTable.status,
      priceInDollars: DbProductTable.priceInDollars,
      description: DbProductTable.descriptiion,
      imageUrl: DbProductTable.imageUrl,
      coursesCount: countDistinct(CourseProductTable.courseId),
      customersCount: countDistinct(PurchaseTable.userId),
    })
    .from(DbProductTable)
    .leftJoin(PurchaseTable, eq(PurchaseTable.productId, DbProductTable.id))
    .leftJoin(
      CourseProductTable,
      eq(CourseProductTable.productId, DbProductTable.id),
    )
    .orderBy(asc(DbProductTable.name))
    .groupBy(DbProductTable.id);
}
