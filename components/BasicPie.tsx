import * as React from "react";
import { PieChart } from "@mui/x-charts/PieChart";
// import { getCourseProgress } from "../../requests/courses";

// Use the user's id to look up their certificates
// Get the user's course_ids from certificates collection
// IF the certificate has an updated_at, then use that timestamp. IF the timestamp is < 365 days ago, then add to completed courses array
// IF the certificate doesn't have an updated_at, then use the created_at timestamp. If the timestamp is < 365 days ago, then add to completed courses array
//
// Get the user's required course track by looking up user > organization_id > tracks > course_ids > courses

// TODO: get the completed courses from the certificates collection
const completedCourses = ["Test Course", "Sample Course", "Beginner Course"];
// TODO: get the required courses from the tracks collection
const requiredCourses = [
  "Test Course",
  "Sample Course",
  "Beginner Course",
  "Advanced Test Course",
  "Intermediate Sample",
  "New Course",
];

function calculateScore(completedCourses: string[], requiredCourses: string[]) {
  const completedRequired = requiredCourses.filter((course) => {
    return completedCourses.includes(course);
  });
  const score = (completedRequired.length / requiredCourses.length) * 100;
  return score;
}

export default function BasicPie() {
  const score = calculateScore(completedCourses, requiredCourses);
  if (!score) {
    return <div>Loading...</div>;
  }
  React.useEffect(() => {
    // getCourseProgress();
  }, []);

  return (
    <PieChart
      slotProps={{
        legend: {
          direction: "column",
          position: { vertical: "middle", horizontal: "right" },
          padding: 20,
        },
      }}
      series={[
        {
          data: [
            // labels? would have to track user's selection && completion of a course that matches selection
            // values - calculation of completed courses/required courses * 100
            {
              id: 0,
              value: 20,
              label: "Ethics & Legal",
              color: "var(--color-indigo-250",
            },
            {
              id: 1,
              value: 30,
              label: "Counseling",
              color: "var(--color-indigo-350)",
            },
            {
              id: 2,
              value: score,
              label: "Human Resources",
              color: "var(--color-indigo-400)",
            },
          ],
          innerRadius: 30,
          outerRadius: 100,
          paddingAngle: 4,
          cornerRadius: 5,
          startAngle: 0,
          endAngle: 360,
          cx: "25%",
          // cy: "50%",
        },
      ]}
      width={400}
      height={300}
    />
  );
}