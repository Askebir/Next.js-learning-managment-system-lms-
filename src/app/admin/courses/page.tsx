import { db } from "@/src";
import PageHeader from "@/src/components/PageHeader";
import { Button } from "@/src/components/ui/button";
import { CourseTable } from "@/src/features/courses/components/CourseTable";
import { getCourseGlobalTag } from "@/src/features/courses/db/cache/courses";
import {
  CourseSectionTable,
  CourseTable as DbCourseTable,
  LessonTable,
  UserCourseAccessTable,
} from "@/src/drizzle/schema";

import Link from "next/link";
import { asc, countDistinct, eq } from "drizzle-orm";
import { cacheTag } from "next/cache";
import { getUserCourseAccessGlobalTag } from "@/src/features/courses/db/cache/userCourseAccess";
import { getUserCourseSectionGlobalTag } from "@/src/features/courseSections/db/cache";
import { getLessonGlobalTag } from "@/src/features/lessons/db/cache/cache";

export default async function CoursesPage() {
  const courses = await getCourse();

  return (
    <div className="container mx-3 my-6">
      <PageHeader title="Course">
        <Button asChild>
          <Link href="/admin/courses/new">New Course</Link>
        </Button>
      </PageHeader>

      <CourseTable courses={courses} />
    </div>
  );
}

async function getCourse() {
  "use cache";

  cacheTag(
    getCourseGlobalTag(),
    getUserCourseAccessGlobalTag(),
    getUserCourseSectionGlobalTag(),
    getLessonGlobalTag(),
  );

  return db
    .select({
      id: DbCourseTable.id,
      name: DbCourseTable.name,

      sectionsCount: countDistinct(CourseSectionTable),
      lessonsCount: countDistinct(LessonTable),
      studentsCount: countDistinct(UserCourseAccessTable),
    })
    .from(DbCourseTable)
    .leftJoin(
      CourseSectionTable,
      eq(CourseSectionTable.courseId, DbCourseTable.id),
    )
    .leftJoin(LessonTable, eq(LessonTable.sectionId, CourseSectionTable.id))
    .leftJoin(
      UserCourseAccessTable,
      eq(UserCourseAccessTable.courseId, DbCourseTable.id),
    )
    .orderBy(asc(DbCourseTable.name))
    .groupBy(DbCourseTable.id);
}
