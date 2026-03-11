import PageHeader from "@/src/components/PageHeader";
import { Button } from "@/src/components/ui/button";

import Link from "next/link";

export default function CoursesPage() {
  return (
    <div className="container mx-3 my-6">
      <PageHeader title="Course">
        <Button asChild>
          <Link href="/admin/courses/new">New Course</Link>
        </Button>
      </PageHeader>

      <div>red</div>
    </div>
  );
}
