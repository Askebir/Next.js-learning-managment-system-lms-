import { db } from "@/src";
import { UserCourseAccessTable } from "@/src/drizzle/schema";

export async function addUserCourseAccess(
  {
    userId,
    courseIds,
  }: {
    userId: string;
    courseIds: string[];
  },
  trx: Omit<typeof db, "$client"> = db,
) {
  const accesses = await trx
    .insert(UserCourseAccessTable)
    .values(courseIds.map((courseId) => ({ userId, courseId })))
    .returning();

  return accesses;
}
