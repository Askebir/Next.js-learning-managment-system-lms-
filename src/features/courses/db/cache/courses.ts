import { getGlobalTag, getIdTag } from "@/src/lib/dataCache";
import { revalidateTag } from "next/cache";

export function getCourseGlobalTag() {
  return getGlobalTag("courses");
}

export function getCourseIdTag(id: string) {
  return getIdTag("courses", id);
}

export function revalidateCourseCache(id: string) {
  revalidateTag(getCourseGlobalTag(), "max");
  revalidateTag(getCourseIdTag(id), "max");
}
