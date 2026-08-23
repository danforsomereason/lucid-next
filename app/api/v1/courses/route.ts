import db from '@/db'
import { coursesTable, usersTable } from '@/schema'
import { readCoursesOutputSchema } from '@/types'
import authenticate from '@/utils/authenticate'
import { eq, inArray } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export async function GET () {
  const user = await authenticate()
  if (!user || !user.organizationId) {
    const output: unknown[] = []
    return NextResponse.json({ output })
  }
  const usersWhere = eq(usersTable.organizationId, user.organizationId)
  const users = await db.query.usersTable.findMany({ where: usersWhere })

  const userIds = users.map(user => user.id)
  const coursesWhere = inArray(coursesTable.instructorId, userIds)

  const courses = await db.query.coursesTable.findMany({ where: coursesWhere })

  const output = readCoursesOutputSchema.parse(courses)
  return NextResponse.json(output)
}