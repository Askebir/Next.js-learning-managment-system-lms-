import { Button } from "@/components/ui/button";
import { db } from "@/src";
import { ActionButton } from "@/src/components/ActionButton";
import PageHeader from "@/src/components/PageHeader";
import {
  CourseTable,
  LessonStatus,
  LessonTable,
  UserLessonComleteTable,
} from "@/src/drizzle/schema";
import { YouTubeVideoPlayer } from "@/src/features/lessons/components/YouTubeVideoPlayer";
import {
  canViewLesson,
  wherePublicLessons,
} from "@/src/features/lessons/permissions/lessons";
import { canUpdateUserLessonCompleteStatus } from "@/src/features/lessons/permissions/userLessonComplete";
import { getCurrentUser } from "@/src/services/clerk";
import { and, eq } from "drizzle-orm";
import { CheckSquare2Icon, LockIcon, XSquareIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReactNode, Suspense } from "react";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = await params;
  console.log(courseId, lessonId, "courseID AN LESON ID");
  const lesson = await getLesson(lessonId);

  if (lesson == null) return notFound();
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <SuspenseBoundary lesson={lesson} courseId={courseId} />
    </Suspense>
  );
}

function LoadingSkeleton() {}

async function SuspenseBoundary({
  lesson,
  courseId,
}: {
  lesson: {
    id: string;
    youtubeVideoId: string;
    name: string;
    description: string | null;
    status: LessonStatus;
    sectionId: string;
  };
  courseId: string;
}) {
  const { userId, role } = await getCurrentUser();
  const isLessonComplete =
    userId == null
      ? false
      : await getIsLessonComplete({ lessonId: lesson.id, userId });

  const canView = await canViewLesson({ role, userId }, lesson);

  const canUpdateCompletionStatus = await canUpdateUserLessonCompleteStatus(
    {
      userId,
    },
    lesson.id,
  );

  return (
    <div className="my-4 flex flex-col gap-4">
      <div className="aspect-video">
        {canView ? (
          <YouTubeVideoPlayer
            videoId={lesson.youtubeVideoId}
            onFinishedVideo={
              !isLessonComplete && canUpdateCompletionStatus
                ? canUpdateUserLessonCompleteStatus.bind(null, lesson.id, true)
                : undefined
            }
          />
        ) : (
          <div className="flex items-center justify-center bg-primary-foreground h-full w-full">
            <LockIcon className="size-16" />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-">
        <div className="flex justify-between items-start gap-4">
          <h1 className="text-2xl font-semibold">{lesson.name}</h1>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" asChild>
              <Link href="">Previous</Link>
            </Button>
            {canUpdateUserLessonCompleteStatus && (
              <ActionButton action={null} variant="outline">
                <div className="flex gap-2 items-center">
                  {isLessonComplete ? (
                    <>
                      <CheckSquare2Icon /> Mark Incomplete
                    </>
                  ) : (
                    <>
                      <XSquareIcon /> Mark Complete
                    </>
                  )}
                </div>
              </ActionButton>
            )}

            <Button variant="outline" asChild>
              <Link href="">Next</Link>
            </Button>
          </div>
        </div>
        {canView ? (
          lesson.description && <p>{lesson.description}</p>
        ) : (
          <p>This lesson is locked. please purchase the course to view it.</p>
        )}
      </div>
    </div>
  );
}

async function getLesson(id: string) {
  return db.query.LessonTable.findFirst({
    columns: {
      id: true,
      youtubeVideoId: true,
      name: true,
      description: true,
      status: true,
      sectionId: true,
    },

    where: and(eq(LessonTable.id, id), wherePublicLessons),
  });
}

async function getIsLessonComplete({
  userId,
  lessonId,
}: {
  userId: string;
  lessonId: string;
}) {
  const data = await db.query.UserLessonComleteTable.findFirst({
    where: and(
      eq(UserLessonComleteTable.userId, userId),
      eq(UserLessonComleteTable.lessonId, lessonId),
    ),
  });

  return data != null;
}
