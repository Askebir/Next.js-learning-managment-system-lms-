import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import PurchasePage from "@/src/app/(consumer)/products/[productId]/purchase/page";
import {
  SkeletonArray,
  SkeletonButton,
  SkeletonText,
} from "@/src/components/Skeleton";
import { Badge } from "@/src/components/ui/badge";
import { PurchaseTable } from "@/src/drizzle/schema";
import { formatDate, formatPrice } from "@/src/lib/formatters";
import Image from "next/image";
import Link from "next/link";

export function UserPurchaseTable({
  purchases,
}: {
  purchases: {
    id: string;
    pricePaidInCents: number;
    createdAt: Date;
    refundedAt: Date | null;
    productDetails: {
      name: string;
      imageUrl: string;
    };
  }[];
}) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHead>
      <TableBody>
        {purchases.map((purchase) => (
          <TableRow key={purchase.id}>
            <TableCell>
              <div className="flex items-center gap-4">
                <Image
                  className="object-cover rounded size-12"
                  src={purchase.productDetails.imageUrl}
                  alt={purchase.productDetails.name}
                  width={192}
                  height={192}
                />
                <div className="flex flex-col gap-1">
                  <div className="font-semibold">
                    {purchase.productDetails.name}
                  </div>
                  <div className="text-muted-foreground">
                    {formatDate(purchase.createdAt)}
                  </div>
                </div>
              </div>
            </TableCell>
            <TableCell>
              {purchase.refundedAt ? (
                <Badge variant="outline">Refunded</Badge>
              ) : (
                formatPrice(purchase.pricePaidInCents / 100)
              )}
            </TableCell>
            <TableCell>
              <Button variant="outline" asChild>
                <Link href={`/purchases/${purchase.id}`}>Details</Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function UserPurchaseTableSkeleton() {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHead>
      <TableBody>
        <SkeletonArray amount={3}>
          <TableRow>
            <TableCell>
              <div className="flex items-center gap-4" />
              <div className="size=12 bg-secondary animate-pulse rounded" />
              <div className="flex flex-col gap-1">
                <SkeletonText className="w-32" />
                <SkeletonText className="w-32" />
              </div>
            </TableCell>
            <TableCell>
              <SkeletonText className="w-12" />
            </TableCell>
            <TableCell>
              <SkeletonButton />
            </TableCell>
          </TableRow>
        </SkeletonArray>
      </TableBody>
    </Table>
  );
}
