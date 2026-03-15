import { getCourseTag, getGlobalTag, getIdTag } from "@/src/lib/dataCache";
import { revalidateTag } from "next/cache";

export function getUserCourseSectionGlobalTag() {
  return getGlobalTag("courseSections");
}

export function getCourseSectionIdTag(id: string) {
  return getIdTag("courseSections", id);
}

export function getCourseSectionCourseTag(courseId: string) {
  return getCourseTag("courseSections", courseId);
}

export function revalidateCourseSectionCache({
  id,
  courseId,
}: {
  id: string;
  courseId: string;
}) {
  revalidateTag(getUserCourseSectionGlobalTag(), "max");
  revalidateTag(getCourseSectionIdTag(id), "max");
  revalidateTag(getCourseSectionCourseTag(courseId), "max");
}
