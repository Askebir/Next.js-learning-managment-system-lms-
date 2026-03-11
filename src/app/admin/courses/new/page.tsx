import PageHeader from "@/src/components/PageHeader";
import CourseForm from "@/src/features/courses/components/CourseForm";
import React from "react";

export default function NewCoursePage() {
  return (
    <div className="container my-6">
      <PageHeader title="New Course" />
      <CourseForm />
    </div>
  );
}
