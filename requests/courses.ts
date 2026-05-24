import { readCoursesOutputSchema } from "@/types";
import axios from "axios";

export async function getCourses() {
  const url = 'http://localhost:3000/api/v1/courses';
  const response = await axios.get(url);
  const output = readCoursesOutputSchema.parse(response.data)
  return output;
}

export async function getCoursesByCategory(categoryId: string) {
  const url = `http://localhost:3000/api/v1/courses/category/${categoryId}`;
  const response = await axios.get(url);
  return response.data;
}
