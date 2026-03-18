"use client";
import { SortableItem, SortableList } from "@/src/components/SortableList";
import { CourseSectionStatus } from "@/src/drizzle/schema";
import { EyeClosedIcon, Trash2Icon } from "lucide-react";
import { SectionFormDialog } from "./sectionFormDialog";
import { DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ActionButton } from "@/src/components/ActionButton";
import { deleteSection, updateSection } from "../db/section";
import { cn } from "@/lib/utils";
import { DeleteAction, updateSectionOrders } from "../actions/section";

export function SortableLessonList({

  sections,
  lessons,
}: {
  
  sections: {
    id: string;
    name: string;
   
  }[];
  lessons:{
    id:string;
    name:string;
    status:CourseSectionStatus
  }[]
}) {

  return (
    <SortableList items={sections} onOrderChange={updateSectionOrders}>
      {(items) =>
        items.map((section) => (
          <SortableItem
            key={section.id}
            id={section.id}
            className="flex items-center bg-red-500 justify-between gap-1"
          >
            <div
              className={cn(
                "contents",
                section.status === "private" &&
                  " flex items-center text-muted-foreground",
              )}
            >
              {section.status === "private" && (
                <EyeClosedIcon className="size-4  " />
              )}{" "}
              {section.name}
            </div>

            <SectionFormDialog section={section} courseId={courseId}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className=" ml-auto">
                  Edit
                </Button>
              </DialogTrigger>
            </SectionFormDialog>

            <ActionButton
              action={() => DeleteAction(section.id)}
              requireAreYouSure
              size="sm"
            >
              <Trash2Icon />
              <span className="sr-only">Delete</span>
            </ActionButton>
          </SortableItem>
        ))
      }
    </SortableList>
  );
}
