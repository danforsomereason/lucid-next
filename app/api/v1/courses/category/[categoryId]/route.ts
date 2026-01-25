import db from "@/db"
import { courseCategoriesTable } from "@/schema"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function GET (
  request: Request,
  context: { params: { categoryId: string }
}) {
  const courseCategories = await db.query.courseCategoriesTable.findMany({
    where: eq(courseCategoriesTable.categoryId, context.params.categoryId),
    with: {
      course: true
    }
  })
  const courses = courseCategories.map(courseCategory => courseCategory.course)
  return NextResponse.json(courses)
}