import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CourseSectionStatus } from "@/src/drizzle/schema";
import { ReactNode } from "react";
import SectionForm from "./SectionForm";

export function SectionFormDialog({
  courseId,
  section,
  children,
}: {
  courseId: string;
  children: ReactNode;
  section?: { id: string; name: string; status: CourseSectionStatus };
}) {
  return (
    <Dialog>
      {children}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {section == null ? "NeW Section" : `Edit ${section.name}`}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <SectionForm section={section} courseId={courseId} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
