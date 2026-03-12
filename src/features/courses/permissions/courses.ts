import { UserRole } from "@/src/drizzle/schema";

export function canCreateCourses({ role }: { role?: UserRole }) {
  return role === "admin";
}

export function canDeleteCourses({ role }: { role: UserRole | undefined }) {
  return role === "admin";
}
