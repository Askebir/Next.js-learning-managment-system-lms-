import { db } from "@/src";
import { CourseSectionTable } from "@/src/drizzle/schema";

export async function insetrSection({
  courseId,
  data,
}: {
  courseId: string;
  data: typeof CourseSectionTable.$inferInsert;
}) {
  return db
    .insert(CourseSectionTable)
    .values(data)
    .where(CourseSectionTable.courseId, courseId);
}
