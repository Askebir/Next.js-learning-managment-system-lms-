import { db } from "@/src";
import { CourseSectionTable, LessonTable } from "@/src/drizzle/schema";
import { eq } from "drizzle-orm";
import { revalidateLessonCache } from "./cache/cache";

export async function getNextCourseLessonOrder(sectionId: string) {
  const lesson = await db.query.LessonTable.findFirst({
    columns: { order: true },
    where: ({ sectionId: sectionIdCol }, { eq }) => eq(sectionIdCol, sectionId),
    orderBy: ({ order }, { desc }) => desc(order),
  });

  return lesson ? lesson.order + 1 : 0;
}

export async function insertLesson(data: typeof LessonTable.$inferInsert) {
  const [newLesson, courseId] = await db.transaction(async (trx) => {
    const [[newLesson], section] = await Promise.all([
      trx.insert(LessonTable).values(data).returning(),
      trx.query.CourseSectionTable.findFirst({
        columns: { courseId: true },
        where: eq(CourseSectionTable.id, data.sectionId),
      }),
    ]);

    if (section == null) return trx.rollback();
    return [newLesson, section.courseId];
  });

  if (newLesson == null) throw new Error("Failed to create lesson");

  revalidateLessonCache({ courseId, id: newLesson.id });

  return newLesson;
}

export async function updateLesson(
  id: string,
  data: Partial<typeof LessonTable.$inferInsert>,
) {
  const [updatedLesson, courseId] = await db.transaction(async (trx) => {
    const currentLesson = await trx.query.LessonTable.findFirst({
      where: eq(LessonTable.id, id),
      columns: { sectionId: true },
    });

    if (
      data.sectionId != null &&
      currentLesson?.sectionId !== data.sectionId &&
      data.order == null
    ) {
      data.order = await getNextCourseLessonOrder(data.sectionId);
    }

    const [updatedLesson] = await trx
      .update(LessonTable)
      .set(data)
      .where(eq(LessonTable.id, id))
      .returning();
    if (updatedLesson == null) {
      throw (trx.rollback(), new Error("Failed to update lesson"));
    }

    const section = await trx.query.CourseSectionTable.findFirst({
      columns: { courseId: true },
      where: eq(CourseSectionTable.id, updatedLesson?.sectionId),
    });

    if (section == null) return trx.rollback();
    return [updatedLesson, section.courseId];
  });

  revalidateLessonCache({ courseId, id: updatedLesson.id });

  return updateLesson;
}

export async function deleteLesson(id: string) {
  const [deleteLesson, courseId] = await db.transaction(async (trx) => {
    const [deleteLesson] = await trx
      .delete(LessonTable)
      .where(eq(LessonTable.id, id))
      .returning();
    if (deleteLesson == null) {
      trx.rollback();
      throw new Error("Failed to delete lesson");
    }

    const section = await trx.query.CourseSectionTable.findFirst({
      columns: { courseId: true },
      where: ({ id }, { eq }) => eq(id, deleteLesson.sectionId),
    });
    if (section == null) return trx.rollback();
    return [deleteLesson, section.courseId];
  });

  revalidateLessonCache({
    id: deleteLesson.id,
    courseId,
  });

  return deleteLesson;
}

export async function updateLessonOrders(lessonIds: string[]) {
  try {
    const [lessons, courseId] = await db.transaction(async (trx) => {
      const lessons = await Promise.all(
        lessonIds.map((id, index) =>
          trx
            .update(LessonTable)
            .set({ order: index })
            .where(eq(LessonTable.id, id))
            .returning({
              sectionId: LessonTable.sectionId,
              id: LessonTable.id,
            }),
        ),
      );

      const sectionId = lessons[0]?.[0]?.sectionId;
      if (sectionId == null) return trx.rollback();

      const section = await trx.query.CourseSectionTable.findFirst({
        columns: { courseId: true },
        where: ({ id }, { eq }) => eq(id, sectionId),
      });

      if (section == null) return trx.rollback();

      return [lessons, section.courseId] as const;
    });

    lessons.flat().forEach(({ id }) => {
      revalidateLessonCache({
        courseId,
        id,
      });
    });

    // ✅ RETURN THIS
    return { error: false, message: "Order updated successfully" };
  } catch (err) {
    return { error: true, message: "Failed to update order" };
  }
}
