"use server";

import z from "zod";
import { courseSchema } from "../schema/courses";
import { getCurrentUser } from "@/src/services/clerk";
import { redirect } from "next/navigation";
import { sectionSchema } from "../db/schema/sections";
import { canCreateCourseSections } from "../permissions/section";

export async function createSection(
  courseId: string,
  unsafeData: z.infer<typeof sectionSchema>,
) {
  const { success, data } = sectionSchema.safeParse(unsafeData);

  if (!success || !canCreateCourseSections(await getCurrentUser())) {
    return { error: true, massage: "There was an error creating your section" };
  }

  await insetrSection({ ...data, courseId });

  return { error: false, message: "Successfully created your section" };
}

export async function deleteCourse(id: string) {
  if (!canDeleteCourses(await getCurrentUser())) {
    return { error: true, message: "Error deleting your course" };
  }

  await deleteCourseDB(id);
  return { error: false, message: "Successsfully deleted your course" };
}

export async function updateCourses(
  id: string,
  unsafeData: z.infer<typeof courseSchema>,
) {
  const { success, data } = courseSchema.safeParse(unsafeData);
  if (!success || !canUpdateCourse(await getCurrentUser())) {
    return { error: true, message: "There was an error updating your cuurse" };
  }

  await updateCoursesDb(id, data);

  return { error: false, message: "Successfully updated your course" };
}
