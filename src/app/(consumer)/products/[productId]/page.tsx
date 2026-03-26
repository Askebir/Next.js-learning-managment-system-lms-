import { db } from "@/src";
import {
  CourseSectionTable,
  LessonTable,
  ProductTable,
} from "@/src/drizzle/schema";
import { wherePublicCourseSections } from "@/src/features/courseSections/permissions/section";
import { wherePublicLessons } from "@/src/features/lessons/permissions/lessons";
import { wherePublicProducts } from "@/src/features/products/permissions/lessons";
import { formatPrice } from "@/src/lib/formatters";
import { sumArray } from "@/src/lib/sumArray";
import { and, asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const product = await getPublicProduct(productId);

  if (product == null) return notFound();

  const courseCount = product.course.length;
  const lessonCount = sumArray(product.course, (course) =>
    sumArray(course.courseSections, (s) => s.lessons.length),
  );

  return (
    <div className="container my-6 ">
      <div className="flex gap-16 items-center justify-between ">
        <div className="flex gap-67 flex-col items-start ">
          <div className="flex flex-col gap-2 ">
            <Suspense
              fallback={
                <div className="text-xl">
                  {formatPrice(product.priceInDollars)}
                </div>
              }
            ></Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

async function getPublicProduct(id: string) {
  const product = await db.query.ProductTable.findFirst({
    columns: {
      id: true,
      name: true,
      description: true,
      priceInDollars: true,
      imageUrl: true,
    },
    where: and(eq(ProductTable.id, id), wherePublicProducts),
    with: {
      courseProducts: {
        columns: {},
        with: {
          cousre: {
            columns: { id: true, name: true },
            with: {
              courseSections: {
                columns: { id: true, name: true },
                where: wherePublicCourseSections,
                orderBy: asc(CourseSectionTable.order),
                with: {
                  lessons: {
                    columns: { id: true, name: true, status: true },
                    where: wherePublicLessons,
                    orderBy: asc(LessonTable.order),
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (product == null) return product;

  const { courseProducts, ...other } = product;

  return {
    ...other,
    course: courseProducts.map((cp) => cp.cousre),
  };
}
