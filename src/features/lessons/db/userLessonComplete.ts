import { db } from "@/src";
import { UserLessonComleteTable } from "@/src/drizzle/schema";
import { and, eq } from "drizzle-orm";

export async function updateLessonCompleteStatus({
  lessonId,
  userId,
  complete,
}: {
  lessonId: string;
  userId: string;
  complete: boolean;
}) {
  let completion: { lessonId: string; userId: string | undefined } | undefined;

  if (complete) {
    const [c] = await db
      .insert(UserLessonComleteTable)
      .values({
        lessonId,
        userId,
      })
      .onConflictDoNothing()
      .returning();

    completion = c;
  } else {
    const [c] = await db
      .delete(UserLessonComleteTable)
      .where(
        and(
          eq(UserLessonComleteTable.lessonId, lessonId),
          eq(UserLessonComleteTable.userId, userId),
        ),
      )
      .returning();
    completion = c;
  }

  if (completion == null) return;

  if (completion == null) {
    throw new Error("Failed to update lesson completion status");
  }

  return completion;
}
