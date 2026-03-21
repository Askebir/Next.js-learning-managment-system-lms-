import PageHeader from "@/src/components/PageHeader";
import { ProductForm } from "@/src/features/products/components/ProductForm";
import React from "react";

export default function NewProductPage() {
  return (
    <div className="container my-6">
      <PageHeader title="New Product" />
      <ProductForm product={product} />
    </div>
  );
}
