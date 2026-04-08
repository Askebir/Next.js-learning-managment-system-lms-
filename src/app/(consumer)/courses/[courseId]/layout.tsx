import { notFound } from "next/navigation";
import { ReactNode, Suspense } from "react";
import { CoursePageClient } from "./_client";
import { db } from "@/src";
import { asc, eq } from "drizzle-orm";
import {
  CourseSectionTable,
  CourseTable,
  LessonTable,
  UserLessonComleteTable,
  UserLessonCompleteTableRelationships,
} from "@/src/drizzle/schema";
import { wherePublicCourseSections } from "@/src/features/courseSections/permissions/section";
import { wherePublicLessons } from "@/src/features/lessons/permissions/lessons";
import { getCurrentUser } from "@/src/services/clerk";

export default async function CoursePageLayout({
  params,
  children,
}: {
  params: Promise<{ courseId: string }>;
  children: ReactNode;
}) {
  const { courseId } = await params;
  const course = await getCourse(courseId);

  if (course == null) return notFound();

  return (
    <div className="flex w-full min-h-screen">
      {/* Sidebar */}
      <div className="w-[300px] border-r p-4">
        <div className="text-lg font-semibold mb-4">{course.name}</div>
        <Suspense
          fallback={<CoursePageClient course={mapCourse(course, [])} />}
        >
          <SuspenseBoundary course={course} />
        </Suspense>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">{children}</div>
    </div>
  );
}

async function getCourse(id: string) {
  return db.query.CourseTable.findFirst({
    where: eq(CourseTable.id, id),
    columns: { id: true, name: true },
    with: {
      courseSections: {
        orderBy: asc(CourseSectionTable.order),
        where: wherePublicCourseSections,
        columns: { id: true, name: true },
        with: {
          lessons: {
            orderBy: asc(LessonTable.order),
            where: wherePublicLessons,
            columns: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });
}

async function SuspenseBoundary({
  course,
}: {
  course: {
    name: string;
    id: string;
    courseSections: {
      name: string;
      id: string;
      lessons: {
        name: string;
        id: string;
      }[];
    }[];
  };
}) {
  const { userId } = await getCurrentUser();
  const completedLessonIds =
    userId == null ? [] : await getCompletedLessonIds(userId);

  return <CoursePageClient course={mapCourse(course, completedLessonIds)} />;
}

async function getCompletedLessonIds(userId: string) {
  const data = await db.query.UserLessonComleteTable.findMany({
    columns: { lessonId: true },
    where: eq(UserLessonComleteTable.userId, userId),
  });

  return data.map((d) => d.lessonId);
}

function mapCourse(
  course: {
    name: string;
    id: string;
    courseSections: {
      name: string;
      id: string;
      lessons: {
        name: string;
        id: string;
      }[];
    }[];
  },
  completedLessonIds: string[],
) {
  return {
    ...course,
    courseSections: course.courseSections.map((section) => {
      return {
        ...section,
        lessons: section.lessons.map((lesson) => {
          return {
            ...lesson,
            isComplete: completedLessonIds.includes(lesson.id),
          };
        }),
      };
    }),
  };
}
