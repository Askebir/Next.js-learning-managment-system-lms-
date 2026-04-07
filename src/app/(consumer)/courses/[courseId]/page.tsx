import { db } from "@/src";
import PageHeader from "@/src/components/PageHeader";
import { CourseTable } from "@/src/drizzle/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ReactNode } from "react";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const course = await getCourse(courseId);

  if (course == null) return notFound();
  return (
    <div className="my-6 container">
      <PageHeader className="mb-6" title={course.name} />
      <p className="text-muted-foreground">{course.description}</p>
    </div>
  );
}

async function getCourse(id: string) {
  return db.query.CourseTable.findFirst({
    columns: { id: true, name: true, description: true },

    where: eq(CourseTable.id, id),
  });
}
