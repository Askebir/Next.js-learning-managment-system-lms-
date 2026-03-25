import { db } from "@/src";
import {
  CourseSectionTable,
  LessonTable,
  ProductTable,
} from "@/src/drizzle/schema";
import { wherePublicCourseSections } from "@/src/features/courseSections/permissions/section";
import { wherePublicLessons } from "@/src/features/lessons/permissions/lessons";
import { wherePublicProducts } from "@/src/features/products/permissions/lessons";
import { and, asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const product = await getPublicProduct(productId);

  if (product == null) return notFound();
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
