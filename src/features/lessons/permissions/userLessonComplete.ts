import { db } from "@/src";
import {
  CourseSectionTable,
  CourseTable,
  UserCourseAccessTable,
} from "@/src/drizzle/schema";
import { and, eq } from "drizzle-orm";

export async function canUpdateUserLessonCompleteStatus(
  user: { userId: string | undefined },
  lessonId: string,
) {
  if (user.userId == null) return false;
  const [courseAccess] = await db
    .select({ courseId: CourseTable.id })
    .from(UserCourseAccessTable)
    .innerJoin(CourseTable, eq(CourseTable.id, UserCourseAccessTable.courseId))
    .innerJoin(
      CourseSectionTable,
      and(eq(CourseSectionTable.courseId, CourseTable.id)),
    );
}
