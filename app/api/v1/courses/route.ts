import db from '@/db'
import { NextResponse } from 'next/server'

export async function GET () {
  const courses = await db.query.coursesTable.findMany()
  return NextResponse.json(courses)
}