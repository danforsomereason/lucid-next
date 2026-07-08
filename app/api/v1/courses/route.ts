import db from '@/db'
import { readCoursesOutputSchema } from '@/types'
import authenticate from '@/utils/authenticate'
import { NextResponse } from 'next/server'

export async function GET () {
  const user = await authenticate()
  const courses = await db.query.coursesTable.findMany()
  if (user?.organizationId) {
    const organizationCourses = await db
      .select({ course: courses })
      .from(courses)
      .innerJoin(instructors, eq(courses.instructorId, instructors.id))
      .where(eq(instructors.orgId, targetOrgId)) 
  }

  const output = readCoursesOutputSchema.parse(courses)
  return NextResponse.json(output)
}