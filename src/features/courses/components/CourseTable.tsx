import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/src/components/ui/button";
import { formatPlural } from "@/src/lib/formatters";
import { Trash2Icon, TrashIcon } from "lucide-react";
import Link from "next/link";

export function CourseTable({ course }: { course: any[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            {formatPlural(course.length, {
              singular: "course",
              plural: "courses",
            })}
          </TableHead>
          <TableHead>Students</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {course.map((courses) => (
          <TableRow key={course.id}>
            <TableCell>
              <div className="text-muted-foreground">
                {formatPlural(course.sectionsCount, {
                  singular: "section",
                  plural: "sections",
                })}{" "}
                ●{""}
                {formatPlural(course.lessonsCount, {
                  singular: "lesson",
                  plural: "lessons",
                })}
              </div>
            </TableCell>
            <TableCell>{course.studentsCount}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button asChild>
                  <Link href={`/admin/course/${course.id}/edit`}>Edit</Link>
                </Button>
                <ActionButton action={deleteCourse.bind(null, course.id)}>
                  <Trash2Icon />
                  <span className="sr-only">Delete</span>
                </ActionButton>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
