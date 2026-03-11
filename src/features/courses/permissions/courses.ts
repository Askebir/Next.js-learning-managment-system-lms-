import { UserRole } from "@/src/drizzle/schema";

export function canCreateCourses({ role }: { role?: UserRole }) {
  return role === "admin";
}
