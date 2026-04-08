import { db } from "@/src";
import {
  CourseSectionTable,
  CourseTable,
  LessonTable,
  UserCourseAccessTable,
} from "@/src/drizzle/schema";
import { and, eq } from "drizzle-orm";
import { wherePublicCourseSections } from "../../courseSections/permissions/section";

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
      and(
        eq(CourseSectionTable.courseId, CourseTable.id),
        wherePublicCourseSections,
      ),
    )

    .innerJoin(LessonTable, eq(LessonTable.sectionId, CourseSectionTable.id))

    .where(
      and(
        eq(LessonTable.id, lessonId),
        eq(UserCourseAccessTable.userId, user.userId),
      ),
    )
    .limit(1);

  return courseAccess != null;
}
