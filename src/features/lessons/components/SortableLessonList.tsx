"use client";
import { SortableItem, SortableList } from "@/src/components/SortableList";
import { CourseSectionStatus, LessonStatus } from "@/src/drizzle/schema";
import { EyeClosedIcon, Trash2Icon, VideoIcon } from "lucide-react";

import { DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ActionButton } from "@/src/components/ActionButton";

import { cn } from "@/lib/utils";

import { LessonFormDialog } from "./LessonFormDialog";

import { deleteLesson, updateLessonOrder } from "../actions/lesson";

export function SortableLessonList({
  sections,
  lessons,
}: {
  sections: {
    id: string;
    name: string;
  }[];
  lessons: {
    id: string;
    name: string;
    status: LessonStatus;
    youtubeVideoId: string;
    description: string | null;
    sectionId: string;
  }[];
}) {
  return (
    <SortableList items={lessons} onOrderChange={updateLessonOrder}>
      {(items) =>
        items.map((lesson) => (
          <SortableItem
            key={lesson.id}
            id={lesson.id}
            className="flex items-center justify-between gap-1"
          >
            <div
              className={cn(
                "contents",
                lesson.status === "private" &&
                  " flex items-center text-muted-foreground",
              )}
            >
              {lesson.status === "private" && (
                <EyeClosedIcon className="size-4  " />
              )}
              {lesson.status === "preview" && <VideoIcon className="size-4" />}
              {lesson.name}
            </div>

            <LessonFormDialog lesson={lesson} sections={sections}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className=" ml-auto">
                  Edit
                </Button>
              </DialogTrigger>
            </LessonFormDialog>

            <ActionButton
              action={() => deleteLesson(lesson.id)}
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
