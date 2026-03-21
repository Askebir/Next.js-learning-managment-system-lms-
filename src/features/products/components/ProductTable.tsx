import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ActionButton } from "@/src/components/ActionButton";
import { Button } from "@/src/components/ui/button";
import { formatPlural, formatPrice } from "@/src/lib/formatters";
import { EyeIcon, LockIcon, Trash2Icon, TrashIcon } from "lucide-react";
import Link from "next/link";
import { deleteCourse } from "../actions/courses";
import { ProductStatuses } from "@/src/drizzle/schema";
import Image from "next/image";
import { Badge } from "@/src/components/ui/badge";

export function PrdouctTable({
  products,
}: {
  products: {
    id: string;
    name: string;
    desscription: string;
    imageUrl: string;
    priceInDollars: number;
    status: ProductStatuses;
    coursesCount: number;
    customersCount: number;
  }[];
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            {formatPlural(products.length, {
              singular: "product",
              plural: "products",
            })}
          </TableHead>
          <TableHead>Customers</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.id}>
            <TableCell>
              <div className="flex items-center gap-4">
                <Image
                  className="object-cover rounded size-12"
                  src={product.imageUrl}
                  alt={product.name}
                  width={192}
                  height={192}
                />
                <div className="flex flex-col gap-1 ">
                  <div className="font-semibold">{product.name}</div>
                  <div className="text-muted-foreground">
                    {formatPlural(product.coursesCount, {
                      singular: "product",
                      plural: "products",
                    })}{" "}
                    ●{""}
                    {formatPrice(product.priceInDollars)}
                  </div>
                </div>
              </div>
            </TableCell>
            <TableCell>{product.customersCount}</TableCell>
            <TableCell>
              <Badge>
                {getStatusIcon(product.status)}
                {product.status}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button asChild>
                  <Link href={`/admin/products/${product.id}/edit`}>Edit</Link>
                </Button>
                <ActionButton
                  variant="destructive"
                  requireAreYouSure
                  action={deleteProduct.bind(null, product.id)}
                >
                  <Trash2Icon />
                  <span className="sr-only">Delete</span>
                </ActionButton>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function getStatusIcon(status: ProductStatuses) {
  const Icon = {
    public: EyeIcon,
    private: LockIcon,
  }[status];

  return <Icon className="size-4" />;
}
