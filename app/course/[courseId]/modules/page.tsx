import CourseModules from "@/components/CourseModules";
import db from "@/db";
import { quizAnswersTable, assignedCoursesTable, coursesTable, moduleProgressesTable } from "@/schema";
import authenticate from "@/utils/authenticate";
import { eq } from "drizzle-orm";

interface CoursePageProps {
  params: Promise<{ courseId: string }>;
}

export default async function CoursePage({ params }: CoursePageProps) {
  const currentUser = await authenticate()
  if (!currentUser) {
    return <p>You must be logged in to view this course</p>;
  }
  const { courseId } = await params;
  const relatedCourse = await db.query.coursesTable.findFirst({
    where: eq(coursesTable.id, courseId),
    with: {
      assignedCourses: {
        where: eq(assignedCoursesTable.userId, currentUser.id),
      },
      learningObjectives: true,
      instructor: true,
      modules: {
        with: {
          moduleProgresses: {
            where: eq(moduleProgressesTable.userId, currentUser.id)
          }
        }
      },
      questions: {
        with: {
          quizAnswers: {
            where: eq(quizAnswersTable.userId, currentUser.id),
          },
          options: true,
        }
      }
    }
  })
  if (!relatedCourse) {
    return <p>Course not found</p>;
  }
  if (relatedCourse.assignedCourses.length === 0) {
    return <p>You are not assigned to this course</p>;
  }
  const safeQuestions = relatedCourse.questions.map((question) => {
    const { correctOptionOrder, explanation, ...rest } = question
    return rest
  })
  return (
    <CourseModules
      assignedCourse={relatedCourse.assignedCourses[0]}
      relatedCourse={relatedCourse}
      relatedModules={relatedCourse.modules}
      relatedQuestions={safeQuestions}
    />
  )
}