import { Button } from "@/components/ui/button";
import { db } from "@/src";
import { ProductTable } from "@/src/drizzle/schema";
import { wherePublicProducts } from "@/src/features/products/permissions/lessons";
import { and, eq } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";

export default async function ProductPurchaseSuccessPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;

  const product = await getPublicProduct(productId);
  if (product == null) return;
  return (
    <div className="container my-6">
      <div className="flex gap-16 items-center justify-between">
        <div className="flex flex-col gap-4 items-start">
          <div className="text-3xl font-semibold">Purchase Successful</div>
          <div className="text-xl">Thank you for purchasing {product.name}</div>
          <Button asChild className="text-xl h-auto py-4 px-8 rounded-lg">
            <Link href="/courses">View My Course</Link>
          </Button>
        </div>
        <div className="relative aspect-video max-w-lg grow">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-contain rounded-xl"
          />
        </div>
      </div>
    </div>
  );
}

async function getPublicProduct(id: string) {
  return db.query.ProductTable.findFirst({
    columns: {
      name: true,
      imageUrl: true,
    },
    where: and(eq(ProductTable.id, id), wherePublicProducts),
  });
}
