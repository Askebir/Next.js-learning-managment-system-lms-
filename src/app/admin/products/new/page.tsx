import { db } from "@/src";
import PageHeader from "@/src/components/PageHeader";
import { CourseTable } from "@/src/drizzle/schema";
import ProductForm from "@/src/features/products/components/ProductForm";

import { asc } from "drizzle-orm";
import React from "react";

export default async function NewProductPage() {
  return (
    <div className="container my-6">
      <PageHeader title="New Product" />
      <ProductForm courses={await getCourses()} />
    </div>
  );
}

async function getCourses() {
  return db.query.CourseTable.findMany({
    orderBy: asc(CourseTable.name),
    columns: { id: true, name: true },
  });
}
