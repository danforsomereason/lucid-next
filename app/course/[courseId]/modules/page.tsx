import CourseModules from "@/components/CourseModules";
import db from "@/db";
import { answersTable, coursesTable, moduleProgressTable } from "@/schema";
import authenticate from "@/utils/authenticate";
import { eq } from "drizzle-orm";

interface CoursePageProps {
  params: Promise<{ courseId: string }>;
}

export default async function CoursePage({ params }: CoursePageProps) {
  const currentUser = await authenticate(true)
  if (!currentUser) {
    return <p>You must be logged in to view this course</p>;
  }
  const { courseId } = await params;
  const relatedCourse = await db.query.coursesTable.findFirst({
    where: eq(coursesTable.id, courseId),
    with: {
      learningObjectives: true,
      instructor: true,
      modules: {
        with: {
          moduleProgresses: {
            where: eq(moduleProgressTable.userId, currentUser.id)
          }
        }
      },
      questions: {
        with: {
          answers: {
            where: eq(answersTable.userId, currentUser.id),
          },
          options: true,
        }
      }
    }
  })
  if (!relatedCourse) {
    return <p>Course not found</p>;
  }
  const safeQuestions = relatedCourse.questions.map((question) => {
    const { correctOptionOrder, explanation, ...rest } = question
    return rest
  })
  return (
    <CourseModules
      relatedCourse={relatedCourse}
      relatedModules={relatedCourse.modules}
      relatedQuestions={safeQuestions}
    />
  )
}