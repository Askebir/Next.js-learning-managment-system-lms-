"use server";

import z from "zod";
import { courseSchema } from "../schema/courses";
import { getCurrentUser } from "@/src/services/clerk";
import { redirect } from "next/navigation";
import {
  canCreateCourses,
  canDeleteCourses,
  canUpdateCourse,
} from "../permissions/courses";
import {
  deleteCourse as deleteCourseDB,
  insertCourse,
  updateCourse as updateCoursesDb,
} from "../db/courses";

export async function createCourse(unsafeData: z.infer<typeof courseSchema>) {
  const { success, data } = courseSchema.safeParse(unsafeData);

  if (!success || !canCreateCourses(await getCurrentUser())) {
    return { error: true, massage: "There was an error creating your course" };
  }

  const course = await insertCourse(data);

  redirect(`/admin/courses/${course.id}/edit`);
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
