import CourseDescription from "@/components/CourseDescription";
import db from "@/db";
import { coursesTable } from "@/schema";
import { relatedCourseSchema } from "@/types";
import { eq } from "drizzle-orm";

interface CoursePageProps {
  params: Promise<{ courseId: string }>;
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { courseId } = await params;
  const relatedCourse = await db.query.coursesTable.findFirst({
    where: eq(coursesTable.id, courseId),
    with: {
      learningObjectives: true,
      instructor: true,
    }
  })
  if (!relatedCourse) {
    return <p>Course not found</p>;
  }
  const parsed = relatedCourseSchema.parse(relatedCourse)
  return <CourseDescription course={parsed} />;
}