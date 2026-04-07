import { db } from "@/src";
import {
  CourseSectionTable,
  CourseTable,
  LessonStatus,
  LessonTable,
  UserCourseAccessTable,
  UserRole,
} from "@/src/drizzle/schema";
import { and, eq, or } from "drizzle-orm";
import { wherePublicCourseSections } from "../../courseSections/permissions/section";

export function canCreateLessons({ role }: { role?: UserRole }) {
  return role === "admin";
}

export function canDeleteLesssons({ role }: { role: UserRole | undefined }) {
  return role === "admin";
}

export function canUpdateLessons({ role }: { role: UserRole | undefined }) {
  return role === "admin";
}

export const wherePublicLessons = or(
  eq(LessonTable.status, "public"),
  eq(LessonTable.status, "preview"),
);

export async function canViewLesson(
  {
    role,
    userId,
  }: {
    userId: string | undefined;
    role: UserRole | undefined;
  },
  lesson: { id: string; status: LessonStatus },
) {
  if (role === "admin" || lesson.status === "preview") return true;
  if (userId == null || lesson.status === "private") return false;

  const [data] = await db
    .select({
      courseId: CourseTable.id,
    })
    .from(UserCourseAccessTable)
    .leftJoin(CourseTable, eq(CourseTable.id, UserCourseAccessTable.courseId))
    .leftJoin(
      CourseSectionTable,
      and(
        eq(CourseSectionTable.courseId, CourseTable.id),
        wherePublicCourseSections,
      ),
    )
    .leftJoin(
      LessonTable,
      and(eq(LessonTable.sectionId, CourseSectionTable.id), wherePublicLessons),
    )
    .where(
      and(
        eq(LessonTable.id, lesson.id),
        eq(UserCourseAccessTable.userId, userId),
      ),
    )
    .limit(1);

  return data != null && data.courseId != null;
}
