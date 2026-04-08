import { Button } from "@/components/ui/button";
import { db } from "@/src";
import { ActionButton } from "@/src/components/ActionButton";
import PageHeader from "@/src/components/PageHeader";
import { SkeletonButton } from "@/src/components/Skeleton";
import {
  CourseSectionTable,
  CourseTable,
  LessonStatus,
  LessonTable,
  UserLessonComleteTable,
} from "@/src/drizzle/schema";
import { wherePublicCourseSections } from "@/src/features/courseSections/permissions/section";
import { updateLessonCompleteStatus } from "@/src/features/lessons/actions/userLessonComplete";
import { YouTubeVideoPlayer } from "@/src/features/lessons/components/YouTubeVideoPlayer";
import {
  canViewLesson,
  wherePublicLessons,
} from "@/src/features/lessons/permissions/lessons";
import { canUpdateUserLessonCompleteStatus } from "@/src/features/lessons/permissions/userLessonComplete";
import { getCurrentUser } from "@/src/services/clerk";
import { and, asc, desc, eq, gt, lt } from "drizzle-orm";
import { CheckSquare2Icon, LockIcon, XSquareIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReactNode, Suspense } from "react";

export default async function LessonPage({
  params,
}: {
  params: { courseId: string; lessonId: string };
}) {
  const { courseId, lessonId } = params;
  console.log(courseId, lessonId, "courseID AN LESON ID");
  const lesson = await getLesson(lessonId);

  if (lesson == null) return notFound();
  return (
    <Suspense fallback={null}>
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
    order: number;
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

  const PreviousLesson = await getPreviousLesson(lesson);

  return (
    <div className="my-4 flex flex-col gap-4">
      <div className="aspect-video">
        {canView ? (
          <YouTubeVideoPlayer
            videoId={lesson.youtubeVideoId}
            onFinishedVideo={
              !isLessonComplete && canUpdateCompletionStatus
                ? updateLessonCompleteStatus.bind(null, lesson.id, true)
                : undefined
            }
          />
        ) : (
          <div className="flex items-center justify-center bg-primary-foreground h-full w-full">
            <LockIcon className="size-16" />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-start gap-4">
          <h1 className="text-2xl font-semibold">{lesson.name}</h1>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" asChild>
              <Link href="">Previous</Link>
            </Button>
            <Suspense fallback={<SkeletonButton />}>
              <ToLessonButton
                lesson={lesson}
                courseId={courseId}
                lessonFunc={getPreviousLesson}
              >
                Previous
              </ToLessonButton>
            </Suspense>
            {canUpdateCompletionStatus && (
              <ActionButton
                action={updateLessonCompleteStatus.bind(
                  null,
                  lesson.id,
                  !isLessonComplete,
                )}
                variant="outline"
              >
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

            <Suspense fallback={<SkeletonButton />}>
              <ToLessonButton
                lesson={lesson}
                courseId={courseId}
                lessonFunc={getNextLesson}
              >
                Next
              </ToLessonButton>
            </Suspense>
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

async function ToLessonButton({
  children,
  courseId,
  lessonFunc,
  lesson,
}: {
  children: ReactNode;
  courseId: string;
  lesson: {
    id: string;
    sectionId: string;
    order: number;
  };
  lessonFunc: (lesson: {
    id: string;
    sectionId: string;
    order: number;
  }) => Promise<{ id: string } | undefined>;
}) {
  const toLesson = await lessonFunc(lesson);
  if (toLesson == null) return null;
  return (
    <Button variant="outline" asChild>
      <Link href={`/courses/${courseId}/lessons/${toLesson.id}`}>
        {children}
      </Link>
    </Button>
  );
}

async function getPreviousLesson(lesson: {
  id: string;
  sectionId: string;
  order: number;
}) {
  let PreviousLesson = await db.query.LessonTable.findFirst({
    where: and(
      lt(LessonTable.order, lesson.order),
      eq(LessonTable.sectionId, lesson.sectionId),
      wherePublicLessons,
    ),
    orderBy: desc(LessonTable.order),
    columns: { id: true },
  });

  if (PreviousLesson == null) {
    const section = await db.query.CourseSectionTable.findFirst({
      where: eq(CourseSectionTable.id, lesson.sectionId),
      columns: { order: true, courseId: true },
    });

    if (section == null) return;
    const nextSection = await db.query.CourseSectionTable.findFirst({
      where: and(
        lt(CourseSectionTable.order, section.order),
        eq(CourseSectionTable.courseId, section.courseId),
        wherePublicCourseSections,
      ),
      orderBy: desc(LessonTable.order),
      columns: { id: true },
    });

    if (nextSection == null) return;

    PreviousLesson = await db.query.LessonTable.findFirst({
      where: and(eq(LessonTable.sectionId, nextSection.id), wherePublicLessons),
      orderBy: desc(LessonTable.order),
      columns: { id: true },
    });
  }

  return PreviousLesson;
}

async function getNextLesson(lesson: {
  id: string;
  sectionId: string;
  order: number;
}) {
  let nextLesson = await db.query.LessonTable.findFirst({
    where: and(
      gt(LessonTable.order, lesson.order),
      eq(LessonTable.sectionId, lesson.sectionId),
      wherePublicLessons,
    ),
    orderBy: asc(LessonTable.order),
    columns: { id: true },
  });

  if (nextLesson == null) {
    const section = await db.query.CourseSectionTable.findFirst({
      where: eq(CourseSectionTable.id, lesson.sectionId),
      columns: { order: true, courseId: true },
    });

    if (section == null) return;
    const nextSection = await db.query.CourseSectionTable.findFirst({
      where: and(
        gt(CourseSectionTable.order, section.order),
        eq(CourseSectionTable.courseId, section.courseId),
        wherePublicCourseSections,
      ),
      orderBy: asc(LessonTable.order),
      columns: { id: true },
    });

    if (nextSection == null) return;

    nextLesson = await db.query.LessonTable.findFirst({
      where: and(eq(LessonTable.sectionId, nextSection.id), wherePublicLessons),
      orderBy: asc(LessonTable.order),
      columns: { id: true },
    });
  }

  return nextLesson;
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
      order: true,
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
