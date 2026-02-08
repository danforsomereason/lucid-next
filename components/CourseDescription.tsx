'use client'

import React, { useContext } from "react";
import {
    Box,
    Typography,
    Card,
    CardContent,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Grid,
    Skeleton,
    useTheme,
    useMediaQuery,
    Container,
    Button,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import "../styles/CourseDescription.css";
import { globalContext } from "../context/globalContext";
import { useRouter } from "next/navigation";
import { Course, RelatedCourse } from "@/types";

interface CourseDescriptionProps {
  course: RelatedCourse
}

const CourseDescription: React.FC<CourseDescriptionProps> = ({ course }) => {
    const router = useRouter();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const global = useContext(globalContext);

    const handleBeginCourse = async () => {
        const init = { method: "POST" };
        const response = await fetch(
            `/api/v1/assigned_courses/${course.id}`,
            init
        );
        if (response.status === 409) {
            console.log("Course already assigned. Proceeding to modules.");
        } else if (!response.ok) throw new Error("Course not found");

        const data = await response.json();
        console.log("Data - Assigned Course Response", data);

        router.push(`/course/${course.id}/modules`);
    };

    return (
        <Box
            className="course-description-container"
            sx={{
                minHeight: "calc(100vh - 64px)",
                pt: "84px",
                pb: 4,
            }}
        >
            <Container maxWidth="xl">
                <Grid container spacing={4}>
                    {/* Left Column */}
                    <Grid item xs={12} md={6}>
                        <Box
                            sx={{
                                color: "white",
                                position: "sticky",
                                top: "84px",
                            }}
                        >
                            <Typography variant="h2" gutterBottom>
                                {course.title}
                            </Typography>
                            <Typography
                                variant="body1"
                                sx={{
                                    mt: 4,
                                    lineHeight: 1.8,
                                    fontSize: "1.1rem",
                                }}
                            >
                                {course.description}
                            </Typography>
                        </Box>
                    </Grid>

                    {/* Right Column */}
                    <Grid item xs={12} md={6}>
                        <Card
                            sx={{
                                backgroundColor: "rgba(255, 255, 255, 0.95)",
                                backdropFilter: "blur(10px)",
                                position: "sticky",
                                top: "84px",
                                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                            }}
                        >
                            <CardContent sx={{ p: 4 }}>
                                <Grid container spacing={2} sx={{ mb: 4 }}>
                                    <Grid item xs={6}>
                                        <Typography
                                            variant="overline"
                                            color="textSecondary"
                                        >
                                            CE Hours
                                        </Typography>
                                        <Typography
                                            variant="h4"
                                            color="primary"
                                        >
                                            {course.ceHours}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography
                                            variant="overline"
                                            color="textSecondary"
                                        >
                                            Taught By
                                        </Typography>
                                        <Typography
                                            variant="h6"
                                            color="primary"
                                        >
                                            {course.instructor.firstName}
                                            {' '}
                                            {course.instructor.lastName}
                                        </Typography>
                                    </Grid>
                                </Grid>

                                <Typography
                                    variant="h5"
                                    gutterBottom
                                    sx={{ mt: 4 }}
                                >
                                    What You'll Learn
                                </Typography>
                                <List>
                                    {course.learningObjectives.map(
                                        (objective, index) => (
                                            <ListItem
                                                key={index}
                                                sx={{ pl: 0 }}
                                            >
                                                <ListItemIcon
                                                    sx={{ minWidth: 40 }}
                                                >
                                                    <CheckCircleIcon color="primary" />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={objective.objective}
                                                />
                                            </ListItem>
                                        )
                                    )}
                                </List>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleBeginCourse}
                                    fullWidth
                                    sx={{
                                        mt: 4,
                                        py: 1.5,
                                        fontWeight: 600,
                                        boxShadow:
                                            "0 4px 12px rgba(0, 0, 0, 0.15)",
                                        fontSize: "1.1rem",
                                        textTransform: "none",
                                    }}
                                >
                                    Begin Course
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default CourseDescription;