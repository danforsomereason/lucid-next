import AssignedCourseItem from "@/components/AssignedCourseItem";
import db from "@/db";
import { assignedCoursesTable } from "@/schema";
import authenticate from "@/utils/authenticate";
import { eq } from "drizzle-orm";

export default async function DashboardCourses() {
  const currentUser = await authenticate(true)
  if (!currentUser) {
    return <p>Unauthenticated</p>
  }
  const assignments = await db.query.assignedCoursesTable.findMany({
    where: eq(assignedCoursesTable.userId, currentUser.id),
    with: {
      course: true
    }
  })

  return (
    <>
      <h2>Assigned Courses ({assignments.length})</h2>
      <ol>
        {assignments.map((assignment) => (
          <AssignedCourseItem
            key={assignment.id}
            assignment={assignment}
            course={assignment.course}
          />
        ))}
      </ol>
    </>
  );
}