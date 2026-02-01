import { Course } from "@/types";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Box,
  CardActionArea,
} from "@mui/material";
import { useRouter } from 'next/navigation'

interface CourseCardProps {
  course: Course;
  className?: string;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, className }) => {
  const router = useRouter();

  const handleViewDetails = () => {
    router.push(`/course/${course.id}`);
  };

  return (
    <Card className={`course-card ${className || ""}`}>
      <CardHeader
        className="course-card-header"
        title={course.title}
        sx={{
          pb: 0,
          "& .MuiCardHeader-content": {
            "& .MuiCardHeader-title": {
              fontSize: "1.25rem",
              fontWeight: "bold",
            },
          },
        }}
      />
      <CardContent
        className="course-card-content"
        sx={{ pt: 0, position: "relative", height: "100%" }}
      >
        <p>{course.description}</p>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mb: 0,
          }}
        >
          <p>CE Hours: {course.ceHours}</p>

          <Button
            variant="contained"
            color="primary"
            onClick={handleViewDetails}
            sx={{ mt: 0, padding: '4px 12px' }}
          >
            View Details
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CourseCard;