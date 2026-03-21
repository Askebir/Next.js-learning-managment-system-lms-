"use server";
import { db } from "@/src";
import { CourseSectionTable, LessonTable } from "@/src/drizzle/schema";
import { eq } from "drizzle-orm";
import { revalidateLessonCache } from "./cache/cache";
import { revalidatePath } from "next/cache";

export async function getNextCourseLessonOrder(sectionId: string) {
  const lesson = await db.query.LessonTable.findFirst({
    columns: { order: true },
    where: ({ sectionId: sectionIdCol }, { eq }) => eq(sectionIdCol, sectionId),
    orderBy: ({ order }, { desc }) => desc(order),
  });

  return lesson ? lesson.order + 1 : 0;
}

export async function insertLesson(data: typeof LessonTable.$inferInsert) {
  // insert lesson
  const [newLesson] = await db.insert(LessonTable).values(data).returning();

  if (!newLesson) throw new Error("NewLesson not found");

  // get courseId from section
  const section = await db.query.CourseSectionTable.findFirst({
    columns: { courseId: true },
    where: eq(CourseSectionTable.id, data.sectionId),
  });

  if (!section) throw new Error("Section not found");

  revalidatePath("/admin/courses/[courseId]/edit ");

  return newLesson;
}

export async function updateLesson(
  id: string,
  data: Partial<typeof LessonTable.$inferInsert>,
) {
  // get current lesson
  const currentLesson = await db.query.LessonTable.findFirst({
    where: eq(LessonTable.id, id),
    columns: { sectionId: true },
  });

  if (!currentLesson) throw new Error("Lesson not found");

  // if section changed but order not provided, calculate order
  if (
    data.sectionId != null &&
    currentLesson.sectionId !== data.sectionId &&
    data.order == null
  ) {
    data.order = await getNextCourseLessonOrder(data.sectionId);
  }

  // update lesson
  const [updatedLesson] = await db
    .update(LessonTable)
    .set(data)
    .where(eq(LessonTable.id, id))
    .returning();

  if (!updatedLesson) throw new Error("Failed to update lesson");

  // get courseId for cache
  const section = await db.query.CourseSectionTable.findFirst({
    columns: { courseId: true },
    where: eq(CourseSectionTable.id, updatedLesson.sectionId),
  });

  if (!section) throw new Error("Section not found");
  revalidatePath("/admin/courses/[courseId]/edit ");

  return updatedLesson;
}

export async function deleteLesson(id: string) {
  // delete lesson
  const [deletedLesson] = await db
    .delete(LessonTable)
    .where(eq(LessonTable.id, id))
    .returning();

  if (!deletedLesson) throw new Error("Failed to delete lesson");

  // get courseId for cache
  const section = await db.query.CourseSectionTable.findFirst({
    columns: { courseId: true },
    where: eq(CourseSectionTable.id, deletedLesson.sectionId),
  });

  if (!section) throw new Error("Section not found");

  revalidatePath("/admin/courses/[courseId]/edit ");

  return deletedLesson;
}

export async function updateLessonOrders(lessonIds: string[]) {
  if (lessonIds.length === 0)
    return { error: true, message: "No lessons provided" };

  try {
    const lessons = [];

    for (let index = 0; index < lessonIds.length; index++) {
      const lessonId = lessonIds[index];
      if (!lessonId) throw new Error(`Invalid lesson id at index ${index}`);

      const [lesson] = await db
        .update(LessonTable)
        .set({ order: index })
        .where(eq(LessonTable.id, lessonId)) // now guaranteed string
        .returning({ sectionId: LessonTable.sectionId, id: LessonTable.id });

      if (!lesson)
        throw new Error(`Failed to update lesson order for ${lessonId}`);
      lessons.push(lesson);
    }
    // get courseId from first lesson's section
    const sectionId = lessons[0]?.sectionId;
    if (sectionId == null) throw new Error("sectionId error");
    const section = await db.query.CourseSectionTable.findFirst({
      columns: { courseId: true },
      where: eq(CourseSectionTable.id, sectionId),
    });

    if (!section) throw new Error("Section not found");
    revalidatePath("/admin/courses/[courseId]/edit ");

    return { error: false, message: "Order updated successfully" };
  } catch (err) {
    return { error: true, message: "Failed to update order" };
  }
}
