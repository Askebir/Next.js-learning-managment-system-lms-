import { db } from "@/src";
import PageHeader from "@/src/components/PageHeader";
import { CourseTable, LessonTable } from "@/src/drizzle/schema";
import { wherePublicLessons } from "@/src/features/lessons/permissions/lessons";
import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ReactNode } from "react";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = await params;
  const lesson = await getLesson(lessonId);

  if (lesson == null) return notFound();
  return (
    <div className="my-6 container">
      <PageHeader className="mb-6" title={course.name} />
      <p className="text-muted-foreground">{course.description}</p>
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
