'use client'

import React from "react";
import { Box, Card, Typography, Button, Grid, Container } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import GroupsIcon from "@mui/icons-material/Groups";
import BusinessIcon from "@mui/icons-material/Business";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DataUsageIcon from "@mui/icons-material/DataUsage";
import CreateIcon from "@mui/icons-material/Create";
import SupportIcon from "@mui/icons-material/Support";
import { useRouter } from "next/navigation";

export default function Signup () {
    const router = useRouter();

    const handlePlanSelection = (planType: string) => {
        switch (planType) {
            case "Individual":
                router.push("/signup/individual");
                break;
            case "Team":
            case "Organization":
                router.push("/signup/team-org");
                break;
            case "Enterprise":
                router.push("/signup/enterprise");
                break;
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 8 }}>
            <Typography
                variant="h3"
                align="center"
                sx={{
                    mb: 6,
                    color: "var(--secondary-color)",
                    fontWeight: 700,
                }}
            >
                Choose Your Plan
            </Typography>

            <Box>
                <Grid container spacing={4} sx={{ mb: 6 }}>
                    {[
                        {
                            title: "Individual",
                            icon: (
                                <PersonIcon
                                    sx={{
                                        fontSize: 36,
                                        color: "var(--secondary-color)",
                                    }}
                                />
                            ),
                            price: "$50",
                            period: "/year",
                            description: "CEUs for Individual License",
                            features: [
                                "Access to all courses",
                                "Store and track CEU certificates",
                            ],
                        },
                        {
                            title: "Team",
                            icon: (
                                <GroupsIcon
                                    sx={{
                                        fontSize: 36,
                                        color: "var(--secondary-color)",
                                    }}
                                />
                            ),
                            price: "$50",
                            period: "/user/year",
                            description: "For teams up to 10 users",
                            features: [
                                "Everything in Individual",
                                "1 Admin seat included",
                            ],
                        },
                        {
                            title: "Organization",
                            icon: (
                                <BusinessIcon
                                    sx={{
                                        fontSize: 36,
                                        color: "var(--secondary-color)",
                                    }}
                                />
                            ),
                            price: "$45",
                            period: "/user/year",
                            description: "For organizations with 11-100 users",
                            features: [
                                "Everything in Team",
                                "Advanced compliance tracking",
                            ],
                        },
                    ].map((plan) => (
                        <Grid item xs={12} md={4} key={plan.title}>
                            <Card
                                elevation={4}
                                sx={{
                                    height: "100%",
                                    display: "flex",
                                    flexDirection: "column",
                                    p: 4,
                                    borderRadius: 2,
                                    transition:
                                        "transform 0.2s, box-shadow 0.2s",
                                    "&:hover": {
                                        transform: "translateY(-4px)",
                                        boxShadow: 8,
                                    },
                                }}
                            >
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        mb: 3,
                                    }}
                                >
                                    {plan.icon}
                                    <Typography
                                        variant="h5"
                                        sx={{ ml: 2, fontWeight: 600 }}
                                    >
                                        {plan.title}
                                    </Typography>
                                </Box>

                                <Box sx={{ mb: 3 }}>
                                    <Typography
                                        variant="h3"
                                        sx={{
                                            color: "var(--secondary-color)",
                                            fontWeight: 700,
                                        }}
                                    >
                                        {plan.price}
                                        <Typography
                                            component="span"
                                            variant="h6"
                                            sx={{
                                                color: "text.secondary",
                                                ml: 1,
                                            }}
                                        >
                                            {plan.period}
                                        </Typography>
                                    </Typography>
                                    <Typography
                                        variant="subtitle1"
                                        color="text.secondary"
                                        sx={{ mt: 1 }}
                                    >
                                        {plan.description}
                                    </Typography>
                                </Box>

                                <Box sx={{ flexGrow: 1 }}>
                                    {plan.features.map((feature) => (
                                        <Box
                                            key={feature}
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                mb: 2,
                                            }}
                                        >
                                            <CheckCircleIcon
                                                sx={{
                                                    color: "success.main",
                                                    mr: 1.5,
                                                }}
                                            />
                                            <Typography>{feature}</Typography>
                                        </Box>
                                    ))}
                                </Box>

                                <Button
                                    variant="contained"
                                    size="large"
                                    fullWidth
                                    onClick={() =>
                                        handlePlanSelection(plan.title)
                                    }
                                    sx={{
                                        mt: 4,
                                        py: 1.5,
                                        bgcolor: "var(--secondary-color)",
                                        "&:hover": {
                                            bgcolor: "var(--primary-color)",
                                        },
                                        fontWeight: 600,
                                    }}
                                >
                                    GET STARTED
                                </Button>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                <Card
                    sx={{
                        bgcolor: "var(--secondary-color)",
                        color: "white",
                        p: 4,
                        borderRadius: 2,
                        position: "relative",
                        overflow: "hidden",
                    }}
                >
                    <Box sx={{ position: "relative", zIndex: 1 }}>
                        <Typography
                            variant="h5"
                            align="center"
                            sx={{ mb: 4, fontWeight: 600 }}
                        >
                            Need a custom solution for 100+ users?
                        </Typography>

                        <Grid container spacing={2} sx={{ mb: 4 }}>
                            <Grid item xs={12} md={4}>
                                <Box sx={{ textAlign: "center" }}>
                                    <DataUsageIcon
                                        sx={{ fontSize: 30, mb: 1 }}
                                    />
                                    <Typography
                                        variant="subtitle1"
                                        gutterBottom
                                        sx={{ fontWeight: 600 }}
                                    >
                                        Full Compliance Suite
                                    </Typography>
                                    <Box sx={{ mt: 1 }}>
                                        <Typography>
                                            • Visualizations
                                        </Typography>
                                        <Typography>• Data Tracking</Typography>
                                        <Typography>
                                            • Downloadable Reports
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Box sx={{ textAlign: "center" }}>
                                    <CreateIcon sx={{ fontSize: 30, mb: 1 }} />
                                    <Typography
                                        variant="subtitle1"
                                        gutterBottom
                                        sx={{ fontWeight: 600 }}
                                    >
                                        Instructor Option
                                    </Typography>
                                    <Box sx={{ mt: 1 }}>
                                        <Typography>
                                            • Create your own courses
                                        </Typography>
                                        <Typography>
                                            • Custom onboarding
                                        </Typography>
                                        <Typography>
                                            • Internal trainings
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Box sx={{ textAlign: "center" }}>
                                    <SupportIcon sx={{ fontSize: 30, mb: 1 }} />
                                    <Typography
                                        variant="subtitle1"
                                        gutterBottom
                                        sx={{ fontWeight: 600 }}
                                    >
                                        Discounted Pricing
                                    </Typography>
                                    <Box sx={{ mt: 1 }}>
                                        <Typography>• Payment Plans</Typography>
                                        <Typography>
                                            • Enterprise Dashboard
                                        </Typography>
                                        <Typography>
                                            • Licensing & Compliance
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>
                        </Grid>

                        <Box sx={{ textAlign: "center" }}>
                            <Button
                                variant="contained"
                                size="large"
                                onClick={() => router.push("/signup/enterprise")}
                                sx={{
                                    bgcolor: "white",
                                    color: "var(--secondary-color)",
                                    px: 3,
                                    py: 1,
                                    "&:hover": {
                                        bgcolor: "rgba(255, 255, 255, 0.9)",
                                    },
                                    fontWeight: 600,
                                }}
                            >
                                BUILD CUSTOM SOLUTION
                            </Button>
                        </Box>
                    </Box>
                    <Box
                        sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background:
                                "linear-gradient(135deg, var(--secondary-color) 20%, var(--primary-color) 80%)",
                            opacity: 0.7,
                        }}
                    />
                </Card>
            </Box>

            <Box sx={{ textAlign: "center", mt: 4 }}>
                <Typography variant="body1">
                    Already a member?{" "}
                    <Button
                        variant="text"
                        onClick={() => router.push("/signin")}
                        sx={{
                            color: "var(--secondary-color)",
                            textTransform: "none",
                            fontWeight: 600,
                            "&:hover": {
                                color: "var(--primary-color)",
                                background: "none",
                            },
                        }}
                    >
                        Sign In
                    </Button>
                </Typography>
            </Box>
        </Container>
    );
};
