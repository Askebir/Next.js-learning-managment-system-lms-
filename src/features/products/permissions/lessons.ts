import { ProductTable, UserRole } from "@/src/drizzle/schema";
import { eq } from "drizzle-orm";

export function canCreateProducts({ role }: { role?: UserRole }) {
  return role === "admin";
}

export function canDeleteProducts({ role }: { role: UserRole | undefined }) {
  return role === "admin";
}

export function canUpdateProducts({ role }: { role: UserRole | undefined }) {
  return role === "admin";
}

export const wherePublicProducts = eq(ProductTable.status, "public");


