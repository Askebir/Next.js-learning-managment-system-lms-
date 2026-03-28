import { Accordion, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/src";
import { SkeletonButton } from "@/src/components/Skeleton";
import {
  CourseSectionTable,
  LessonTable,
  ProductTable,
} from "@/src/drizzle/schema";
import { wherePublicCourseSections } from "@/src/features/courseSections/permissions/section";
import { wherePublicLessons } from "@/src/features/lessons/permissions/lessons";
import { userOwnsProduct } from "@/src/features/products/db/products";
import { wherePublicProducts } from "@/src/features/products/permissions/lessons";
import { formatPlural, formatPrice } from "@/src/lib/formatters";
import { sumArray } from "@/src/lib/sumArray";
import { getUserCoupon } from "@/src/lib/useCountryHeader";
import { getCurrentUser } from "@/src/services/clerk";
import { and, asc, eq } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";
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
        <div className="flex gap-6 flex-col items-start ">
          <div className="flex flex-col gap-2 ">
            <Suspense
              fallback={
                <div className="text-xl">
                  {formatPrice(product.priceInDollars)}
                </div>
              }
            >
              <Price price={product.priceInDollars} />
            </Suspense>
            <h1 className="text-4xl font-semibold">{product.name}</h1>
            <div className="text-muted-foreground">
              {formatPlural(courseCount, {
                singular: "course",
                plural: "courses",
              })}{" "}
              ●{""}
              {formatPlural(courseCount, {
                singular: "lesson",
                plural: "lessons",
              })}
            </div>
            <div className="text-xl">{product.description}</div>
            <Suspense fallback={<SkeletonButton className="h-16 w-36" />}>
              <PurchaseButton productId={product.id} />
            </Suspense>
          </div>
        </div>
        <div className="relative aspect-video max-w-lg grow ">
          <Image
            src={product.imageUrl}
            fill
            alt={product.name}
            className="object-contain rounded-xl"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8 items-start">
        {product.course.map((course) => (
          <Card key={course.id}>
            <CardHeader>
              <CardTitle>{course.name}</CardTitle>
              <CardDescription>
                {formatPlural(course.courseSections.length, {
                  plural: "section",
                  singular: "section",
                })}{" "}
                ●{""}
                {formatPlural(
                  sumArray(course.courseSections, (s) => s.lessons.length),
                  {
                    plural: "lessons",
                    singular: "lesson",
                  },
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple">
                {course.courseSections.map((section) => (
                  <AccordionTrigger className="flex gap-2">
                    <div className="flex flex-col grow">
                      <span className="text-lg">{section.name}</span>
                      <span className="text-muted-foreground">
                        {formatPlural(section.lessons.length, {
                          plural: "lessons",
                          singular: "lesson",
                        })}
                      </span>
                    </div>
                  </AccordionTrigger>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

async function PurchaseButton({ productId }: { productId: string }) {
  const { userId } = await getCurrentUser();
  const alreadyOwnsProduct =
    userId != null && (await userOwnsProduct({ userId, productId }));
  if (alreadyOwnsProduct) {
    return <p>You already own this product</p>;
  } else {
    return (
      <Button className="text-xl h-auto py-4 px-8 rounded-lg" asChild>
        <Link href={`/products/${productId}/purchase`}>Get Now</Link>
      </Button>
    );
  }
}

async function Price({ price }: { price: number }) {
  const coupon = await getUserCoupon();

  if (price === 0 || coupon == null) {
    return <div className="text-xl">{formatPrice(price)}</div>;
  }

  return (
    <div className="flex gap-2 items-baseline">
      <div className="line-through text-sm opacity-50 ">
        {formatPrice(price)}
      </div>
      <div className="text-xl">
        {formatPrice(price * (1 - coupon.discountPercentage))}
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
