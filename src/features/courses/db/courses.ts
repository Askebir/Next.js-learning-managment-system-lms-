import { db } from "@/src";
import { CourseTable } from "@/src/drizzle/schema";
import { revalidateCourseCache } from "./cache/courses";
import { eq } from "drizzle-orm";

export async function insertCourse(data: typeof CourseTable.$inferInsert) {
  const [newCourse] = await db.insert(CourseTable).values(data).returning();

  if (newCourse == null) throw new Error("Failed to create course");
  revalidateCourseCache(newCourse.id);

  return newCourse;
}

export async function deleteCourse(id: string) {
  const [deletedCourse] = await db
    .delete(CourseTable)
    .where(eq(CourseTable.id, id))
    .returning();

  if (deletedCourse == null) throw new Error("Failed to dailed course");
  revalidateCourseCache(deletedCourse.id);

  return deletedCourse;
}

export async function updateCourse(
  id: string,
  data: typeof CourseTable.$inferInsert,
) {
  const [updatedCourse] = await db
    .update(CourseTable)
    .set(data)
    .where(eq(CourseTable.id, id))
    .returning();

  if (!updatedCourse) throw new Error("Failed to update course");
  revalidateCourseCache(updatedCourse.id);
  return updatedCourse;
}
