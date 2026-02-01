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

export async function getCourseById(courseId: string) {
  try {
    const cleanId = courseId.replace(/^\/+|\/+$/g, "");
    const url = `http://localhost:3000/api/v1/courses/${cleanId}`;
    console.log("Attempting to fetch course with URL:", url);

    const response = await axios.get(url);
    return response.data;
  } catch (error: any) {
    console.error("Error details:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
    });
    throw error;
  }
}

//
export async function getRequiredCourses(organizationId: string) {
  try {
    const url = `http://localhost:3000/api/v1/tracks?organization_id=${organizationId}`;
    const response = await axios.get(url);
  } catch { }
}

// get course progress
export async function getCourseProgress() {
  const url = `http://localhost:3000/api/v1/course_progress`;
  const response = await axios.get(url);
  console.log("Response.data", response.data);
}