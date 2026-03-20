"use server";

import { getCourseTag, getGlobalTag, getIdTag } from "@/src/lib/dataCache";
import { revalidateTag } from "next/cache";

export async function getLessonGlobalTag() {
  return getGlobalTag("lessons");
}

export async function getLessonIdTag(id: string) {
  return getIdTag("lessons", id);
}

export async function getLessonCourseTag(courseId: string) {
  return getCourseTag("lessons", courseId);
}

export async function revalidateLessonCache({
  id,
  courseId,
}: {
  id: string;
  courseId: string;
}) {
  revalidateTag(await getLessonGlobalTag(), "max");
  revalidateTag(await getLessonIdTag(id), "max");
  revalidateTag(await getLessonCourseTag(courseId), "max");
}
