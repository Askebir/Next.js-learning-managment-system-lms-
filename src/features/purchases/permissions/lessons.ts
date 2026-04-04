import { ProductTable, UserRole } from "@/src/drizzle/schema";
import { eq } from "drizzle-orm";

export function canRefundPurchases({ role }: { role?: UserRole }) {
  return role === "admin";
}
