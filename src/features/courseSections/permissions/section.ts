import { CourseSectionTable, UserRole } from "@/src/drizzle/schema";

export function canCreateCourseSections({ role }: { role?: UserRole }) {
  return role === "admin";
}

export function canDeleteCourseSections({
  role,
}: {
  role: UserRole | undefined;
}) {
  return role === "admin";
}

export function canUpdateCourseSections({
  role,
}: {
  role: UserRole | undefined;
}) {
  return role === "admin";
}

export const wherePublicCourseSections = eq(
  CourseSectionTable.status,
  "public",
);
