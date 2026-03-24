import { db } from "@/src";
import PageHeader from "@/src/components/PageHeader";
import { CourseTable, ProductTable } from "@/src/drizzle/schema";
import ProductForm from "@/src/features/products/components/ProductForm";

import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import React from "react";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  console.log("productId", productId);

  const product = await getProduct(productId);
  console.log("product", product);
  if (product == null) return notFound();

  return (
    <div className="container my-6">
      <PageHeader title="New Product" />
      <ProductForm
        product={{
          ...product,
          courseIds: product.courseProducts.map((c) => c.courseId),
        }}
        courses={await getCourses()}
      />
    </div>
  );
}

async function getCourses() {
  return db.query.CourseTable.findMany({
    orderBy: asc(CourseTable.name),
    columns: { id: true, name: true },
  });
}

async function getProduct(id: string) {
  return db.query.ProductTable.findFirst({
    columns: {
      id: true,
      name: true,
      description: true,
      priceInDollars: true,
      status: true,
      imageUrl: true,
    },
    where: eq(ProductTable.id, id),
    with: { courseProducts: { columns: { courseId: true } } },
  });
}
