import { UserRole } from "@/src/drizzle/schema";

export function canCreateProducts({ role }: { role?: UserRole }) {
  return role === "admin";
}

export function canDeleteProducts({ role }: { role: UserRole | undefined }) {
  return role === "admin";
}

export function canUpdateProducts({ role }: { role: UserRole | undefined }) {
  return role === "admin";
}
