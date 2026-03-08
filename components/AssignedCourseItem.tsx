'use client'

import { AssignedCourse, Course } from "@/types"
import Link from "next/link"

interface AssignedCourseItemProps {
  assignment: AssignedCourse,
  course: Course
}

export default function AssignedCourseItem({ assignment, course }: AssignedCourseItemProps) {
  const url = `/course/${course.id}/modules`
  return (
    <li key={assignment.id}>
      <p>{course.title}</p>
      <Link href={url}>
        <button>
          Continue
        </button>
      </Link>
    </li>
  )
}