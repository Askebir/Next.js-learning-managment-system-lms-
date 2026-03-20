"use server";
import z from "zod";
import { lessonSchema } from "../schemas/lesson";
import { getCurrentUser } from "@/src/services/clerk";
import {
  canCreateLessons,
  canDeleteLesssons,
  canUpdateLessons,
} from "../permissions/lessons";
import {
  getNextCourseLessonOrder,
  insertLesson,
  updateLesson as updateLessonDb,
  deleteLesson as deleteLessonDb,
  updateLessonOrders,
} from "../db/lesson";

export async function createLesson(unsafeData: z.infer<typeof lessonSchema>) {
  const { success, data } = lessonSchema.safeParse(unsafeData);

  if (!success || !canCreateLessons(await getCurrentUser())) {
    return { error: true, message: "There was an error creating your lesson" };
  }

  const order = await getNextCourseLessonOrder(data.sectionId);

  await insertLesson({ ...data, order });

  return { error: false, message: "Successfully created your lesson" };
}

export async function updateLesson(
  id: string,
  unsafeData: z.infer<typeof lessonSchema>,
) {
  const { success, data } = lessonSchema.safeParse(unsafeData);

  if (!success || !canUpdateLessons(await getCurrentUser())) {
    return { error: true, message: "There was an error updating our lesson" };
  }

  await updateLessonDb(id, data);
}

export async function deleteLesson(id: string) {
  if (!canDeleteLesssons(await getCurrentUser())) {
    return { error: true, message: "Error deleting your lesson" };
  }

  await deleteLessonDb(id);

  return { error: false, message: "Successfully deleted your lesson" };
}

export async function updateLessonOrder(lessonIds: string[]) {
  if (lessonIds.length === 0 || !canUpdateLessons(await getCurrentUser())) {
    return { error: true, message: "Error reordering your lessons" };
  }

  await updateLessonOrders(lessonIds);

  return { error: false, message: "Successfully reordered your lessons" };
}
