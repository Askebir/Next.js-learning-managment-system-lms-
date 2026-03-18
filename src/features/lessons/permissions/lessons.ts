import { UserRole } from "@/src/drizzle/schema";

export function canCreateLessons({ role }: { role?: UserRole }) {
  return role === "admin";
}

export function canDeleteLesssons({ role }: { role: UserRole | undefined }) {
  return role === "admin";
}

export function canUpdateLessons({ role }: { role: UserRole | undefined }) {
  return role === "admin";
}
