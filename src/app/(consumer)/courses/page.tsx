import PageHeader from "@/src/components/PageHeader";
import Page from "../../(auth)/sign-in/[[...sign-in]]/page";
import { Suspense } from "react";
import { getCurrentUser } from "@/src/services/clerk";
import {
  CourseSectionTable,
  CourseTable,
  LessonTable,
  UserCourseAccessTable,
  UserLessonComleteTable,
} from "@/src/drizzle/schema";
import { and, countDistinct, eq } from "drizzle-orm";
import { db } from "@/src";
import { wherePublicCourseSections } from "@/src/features/courseSections/permissions/section";
import { wherePublicLessons } from "@/src/features/lessons/permissions/lessons";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatPlural } from "@/src/lib/formatters";
import {
  SkeletonArray,
  SkeletonButton,
  SkeletonText,
} from "@/src/components/Skeleton";

export default function CoursesPage() {
  return (
    <div className="container my-6">
      <PageHeader title="My Courses" />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <Suspense
          fallback={
            <SkeletonArray amount={4}>
              <SkeletonCourseCard />
            </SkeletonArray>
          }
        >
          <CourseGrid />
        </Suspense>
      </div>
    </div>
  );
}

async function CourseGrid() {
  const { userId, redirectToSignIn } = await getCurrentUser();
  if (userId == null) return redirectToSignIn();

  const courses = await getUserCourses(userId);

  if (courses.length === 0) {
    return (
      <div className="flex flex-col gap-2 items-start">
        You have no courses yet
        <Button asChild size="lg">
          <Link href="/">Browse Courses</Link>
        </Button>
      </div>
    );
  }

  return courses.map((course) => (
    <Card key={course.id} className="overflow-hidden flex flex-col">
      <CardHeader>
        <CardTitle>{course.name}</CardTitle>
        <CardDescription>
          {formatPlural(course.sectionsCount, {
            plural: "sections",
            singular: "section",
          })}{" "}
          {""}
          {formatPlural(course.lessonsCount, {
            plural: "lessons",
            singular: "lesson",
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className="line-clamp-3" title={course.description}>
        {course.description}
      </CardContent>
      <div className="grow" />
      <CardFooter>
        <Button asChild>
          <Link href={`/courses/${course.id}`}>View Course</Link>
        </Button>
      </CardFooter>
      <div
        className="bg-accent h-2 -mt-2"
        style={{
          width: `${(course.lessonComplete / course.lessonsCount) * 100}%`,
        }}
      ></div>
    </Card>
  ));
}

function SkeletonCourseCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <SkeletonText className="w-3/4" />
        </CardTitle>
        <CardDescription>
          <SkeletonText className="w-1/2" />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SkeletonText rows={3} />
      </CardContent>
      <div className="grow" />
      <CardFooter>
        <SkeletonButton />
      </CardFooter>
    </Card>
  );
}

async function getUserCourses(userId: string) {
  const courses = await db
    .select({
      id: CourseTable.id,
      name: CourseTable.name,
      description: CourseTable.description,
      sectionsCount: countDistinct(CourseSectionTable.id),
      lessonsCount: countDistinct(LessonTable.id),
      lessonComplete: countDistinct(UserLessonComleteTable.lessonId),
    })
    .from(CourseTable)
    .leftJoin(
      UserCourseAccessTable,
      and(
        eq(UserCourseAccessTable.courseId, CourseTable.id),
        eq(UserCourseAccessTable.userId, userId),
      ),
    )
    .leftJoin(
      CourseSectionTable,
      and(
        eq(CourseSectionTable.courseId, CourseTable.id),
        wherePublicCourseSections,
      ),
    )
    .leftJoin(
      LessonTable,
      and(eq(LessonTable.sectionId, CourseSectionTable.id), wherePublicLessons),
    )
    .leftJoin(
      UserLessonComleteTable,
      and(
        eq(UserLessonComleteTable.lessonId, LessonTable.id),
        eq(UserLessonComleteTable.userId, userId),
      ),
    )
    .orderBy(CourseTable.name)
    .groupBy(CourseTable.id);

  return courses;
}
