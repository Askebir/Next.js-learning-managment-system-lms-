import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { db } from "@/src";
import PageHeader from "@/src/components/PageHeader";
import {
  CourseSectionTable,
  CourseTable,
  LessonTable,
} from "@/src/drizzle/schema";
import CourseForm from "@/src/features/courses/components/CourseForm";
import { getCourseIdTag } from "@/src/features/courses/db/cache/courses";
import { SectionFormDialog } from "@/src/features/courseSections/components/sectionFormDialog";
import { SortableSectionList } from "@/src/features/courseSections/components/SortableSectionList";
import { getCourseSectionCourseTag } from "@/src/features/courseSections/db/cache";
import { LessonFormDialog } from "@/src/features/lessons/components/LessonFormDialog";
import { SortableLessonList } from "@/src/features/lessons/components/SortableLessonList";
import { getLessonCourseTag } from "@/src/features/lessons/db/cache/cache";
import { asc, eq } from "drizzle-orm";
import { EyeClosed, EyeClosedIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { cacheTag } from "next/cache";
import { notFound } from "next/navigation";

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;

  const course = await getCourse(courseId);

  if (course == null) return notFound();

  return (
    <div className="container my-6">
      <PageHeader title={course.name} />
      <Tabs defaultValue="lessons">
        <TabsList>
          <TabsTrigger value="lessons">Lessons</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>
        <TabsContent value="lessons" className="flex flex-col gap-2">
          <Card>
            <CardHeader className="flex items-center flex-row justify-between">
              <CardTitle>Sections</CardTitle>
              <SectionFormDialog courseId={courseId}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <PlusIcon /> New Section
                  </Button>
                </DialogTrigger>
              </SectionFormDialog>
            </CardHeader>
            <CardContent>
              <SortableSectionList
                courseId={course.id}
                sections={course.courseSections}
              />
            </CardContent>
          </Card>
          <hr className="my-2" />
          {course.courseSections.map((section) => (
            <Card key={section.id}>
              <CardHeader className="flex items-center flex-row justify-between gap-10 ">
                <CardTitle
                  className={cn(
                    "flex items-center gap-2",
                    section.status === "private" && "text-muted-foreground",
                  )}
                >
                  {" "}
                  {section.status === "private" && <EyeClosed />} {section.name}
                </CardTitle>
                <LessonFormDialog
                  defaultSectionId={section.id}
                  sections={course.courseSections}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <PlusIcon /> New Lesson
                    </Button>
                  </DialogTrigger>
                </LessonFormDialog>
              </CardHeader>
              <CardContent>
                <SortableLessonList
                  sections={course.courseSections}
                  lessons={section.lessons}
                />
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CourseForm course={course} />
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

async function getCourse(id: string) {
  "use cache";

  const courseTag = getCourseIdTag(id); // if this is synchronous, fine
  const sectionTag = getCourseSectionCourseTag(id); // if synchronous, fine
  const lessonTag = await getLessonCourseTag(id); // async, must await

  // now all tags are strings
  cacheTag(courseTag, sectionTag, lessonTag);
  return db.query.CourseTable.findFirst({
    columns: { id: true, name: true, description: true },
    where: eq(CourseTable.id, id),
    with: {
      courseSections: {
        orderBy: asc(CourseSectionTable.order),
        columns: { id: true, status: true, name: true },
        with: {
          lessons: {
            orderBy: asc(LessonTable.order),
            columns: {
              id: true,
              name: true,
              status: true,
              description: true,
              youtubeVideoId: true,
              sectionId: true,
            },
          },
        },
      },
    },
  });
}
