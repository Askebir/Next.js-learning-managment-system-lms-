"use server";

import z from "zod";
import { getCurrentUser } from "@/src/services/clerk";
import { redirect } from "next/navigation";
import { sectionSchema } from "../db/schema/sections";
import {
  canCreateCourseSections,
  canDeleteCourseSections,
  canUpdateCourseSections,
} from "../permissions/section";
import {
  getNextCourseSectionOrder,
  insertSection,
  updateSection as updateSectionDb,
  deleteSection as deleteSectionDB,
} from "../db/section";

export async function createSection(
  courseId: string,
  unsafeData: z.infer<typeof sectionSchema>,
) {
  const { success, data } = sectionSchema.safeParse(unsafeData);

  if (!success || !canCreateCourseSections(await getCurrentUser())) {
    return { error: true, massage: "There was an error creating your section" };
  }

  const order = await getNextCourseSectionOrder(courseId);

  await insertSection({ ...data, courseId, order });

  return { error: false, message: "Successfully created your section" };
}

export async function updateSection(
  id: string,
  unsafeData: z.infer<typeof sectionSchema>,
) {
  const { success, data } = sectionSchema.safeParse(unsafeData);
  if (!success || !canUpdateCourseSections(await getCurrentUser())) {
    return { error: true, message: "There was an error updating your section" };
  }

  await updateSectionDb(id, data);

  return { error: false, message: "Successfully updated your course" };
}

export async function deleteCourse(id: string) {
  if (!canDeleteCourseSections(await getCurrentUser())) {
    return { error: true, message: "Error deleting your section" };
  }

  await deleteSectionDB(id);
  return { error: false, message: "Successsfully deleted your section" };
}
