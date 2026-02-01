import db from '@/db'
import { ReadCoursesOutput, readCoursesOutputSchema } from '@/types'
import { NextResponse } from 'next/server'

export async function GET () {
  const courses: ReadCoursesOutput = await db.query.coursesTable.findMany()
  const output = readCoursesOutputSchema.parse(courses)
  return NextResponse.json(output)
}