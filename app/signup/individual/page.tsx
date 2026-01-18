'use client'

import React, { useState, useEffect, useContext, ChangeEvent } from "react";
import {
    Container,
    Typography,
    Box,
    Stepper,
    Step,
    StepLabel,
    TextField,
    Grid,
    Button,
    Card,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    SelectChangeEvent,
    Link,
} from "@mui/material";
import { format, addYears } from "date-fns";
import { useRouter } from "next/navigation";
import { globalContext } from "@/context/globalContext";
import { checkUserExists } from "@/requests/user";

interface UserFormData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    licenseType: string;
}

const steps = ["Account Details", "Payment Information", "Review"];

const LICENSE_TYPES = [
    { label: "Mental Health Counselor (e.g., LPC, LMHC)", value: 'counseling' },
    { label: "Social Worker", value: 'social_work' },
    // { label: "Marriage & Family Therapist", value: 'counseling' },
    { label: "Licensed Drug and Alcohol Counselor (e.g., LADAC, LCDC)", value: 'addiction_counselor' },
    { label: "Nurse", value: 'nursing' },
    { label: "Psychologist", value: 'psychology' },
    { label: "MD, DO, NP, PA", value: 'physician' },
    // "Other",
    // "Not Applicable",
] as const;

const IndividualCheckout: React.FC = () => {
    const router = useRouter()
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);
    const [activeStep, setActiveStep] = useState(0);
    const [formData, setFormData] = useState<UserFormData>({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        licenseType: "",
    });

    const [formErrors, setFormErrors] = useState<{ message: string } | null>(
        null
    );
    const [verificationMessage, setVerificationMessage] = useState<
        string | null
    >(null);

    const [existingUserMessage, setExistingUserMessage] = useState<
        string | null
    >(null);

    const globalValue = useContext(globalContext);
    console.log("Global Value: ", globalValue);

    const handleTextFieldChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const validateConfirmPassword = (e: React.FocusEvent<HTMLInputElement>) => {
        if (e.target.value !== formData.password) {
            setFormErrors({
                message: "Please ensure your fields are entered correctly",
            });
        } else {
            setFormErrors(null);
        }
    };

    const checkExistingUser = async (e: React.FocusEvent<HTMLInputElement>) => {
        const email = e.target.value;
        if (!email) return;

        try {
            const result = await checkUserExists(email);
            if (result.exists) {
                setExistingUserMessage(
                    "This email is already registered. Would you like to sign in?"
                );
            } else {
                setExistingUserMessage(null);
            }
        } catch (error) {
            console.error("Error checking user:", error);
        }
    };

    const handleNext = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formErrors) return;

        try {
            const data = { ...formData, jobRoleId: 'user' };
            const body = JSON.stringify(data);
            const headers = {
                "Content-Type": "application/json",
            };
            const init = {
                method: "POST",
                body,
                headers,
            };
            const response = await fetch(
                "http://localhost:3000/api/v1/users/signup",
                init
            );
            const output = await response.json();
            console.log(output);
            localStorage.setItem("token", output.token);
            globalValue?.setCurrentUser(output.user);
            router.push("/dashboard");
        } catch (error) {
            console.error("Error during signup:", error);
            setVerificationMessage(
                "An error occurred during signup. Please try again."
            );
        }
    };

    if (!mounted) {
        return null;
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Grid container spacing={4}>
                {/* Left side - Order Summary */}
                <Grid item xs={12} md={4}>
                    <Card sx={{ p: 3, bgcolor: "background.paper" }}>
                        <Typography
                            variant="h6"
                            sx={{ mb: 3, fontWeight: 600 }}
                        >
                            Order Summary
                        </Typography>

                        <Box sx={{ mb: 3 }}>
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    mb: 2,
                                }}
                            >
                                <Typography color="text.secondary">
                                    Individual Plan
                                </Typography>
                                <Typography>$50.00</Typography>
                            </Box>
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    mb: 2,
                                }}
                            >
                                <Typography color="text.secondary">
                                    Duration
                                </Typography>
                                <Typography>
                                    {format(new Date(), "MM/dd/yyyy")} -{" "}
                                    {format(
                                        addYears(new Date(), 1),
                                        "MM/dd/yyyy"
                                    )}
                                </Typography>
                            </Box>
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    pt: 2,
                                    borderTop: 1,
                                    borderColor: "divider",
                                }}
                            >
                                <Typography variant="h6">Total</Typography>
                                <Typography variant="h6" color="primary">
                                    $50.00
                                </Typography>
                            </Box>
                        </Box>
                    </Card>
                </Grid>

                {/* Right side - Checkout Form */}

                <Grid item xs={12} md={8}>
                    <Box sx={{ width: "100%", mb: 4 }}>
                        <Stepper activeStep={activeStep}>
                            {steps.map((label) => (
                                <Step key={label}>
                                    <StepLabel>{label}</StepLabel>
                                </Step>
                            ))}
                        </Stepper>
                    </Box>

                    {activeStep === 0 && (
                        <Box component="form" noValidate onSubmit={handleNext}>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        required
                                        fullWidth
                                        label="First Name"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleTextFieldChange}
                                        autoComplete="given-name"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        required
                                        fullWidth
                                        label="Last Name"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleTextFieldChange}
                                        autoComplete="family-name"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        required
                                        fullWidth
                                        label="Email Address"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleTextFieldChange}
                                        onBlur={checkExistingUser}
                                        autoComplete="email"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        required
                                        fullWidth
                                        label="Password"
                                        name="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={handleTextFieldChange}
                                        autoComplete="new-password"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        required
                                        fullWidth
                                        label="Confirm Password"
                                        name="confirmPassword"
                                        type="password"
                                        value={formData.confirmPassword}
                                        onChange={handleTextFieldChange}
                                        onBlur={validateConfirmPassword}
                                        autoComplete="new-password"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControl fullWidth required>
                                        <InputLabel>License Type</InputLabel>
                                        <select
                                            name="licenseType"
                                            value={formData.licenseType}
                                            onChange={handleSelectChange}
                                        >
                                            {LICENSE_TYPES.map((license) => (
                                                <option
                                                    key={license.value}
                                                    value={license.value}
                                                >
                                                    {license.label}
                                                </option>
                                            ))}
                                        </select>
                                    </FormControl>
                                </Grid>
                                {verificationMessage && (
                                    <Grid item xs={12}>
                                        <Typography color="error">
                                            {verificationMessage}
                                        </Typography>
                                    </Grid>
                                )}
                                {existingUserMessage && (
                                    <Typography color="primary" sx={{ mt: 1 }}>
                                        {existingUserMessage}
                                        <Link href="/login" sx={{ ml: 1 }}>
                                            Sign in
                                        </Link>
                                    </Typography>
                                )}
                            </Grid>

                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    mt: 3,
                                }}
                            >
                                <Button
                                    variant="contained"
                                    type="submit"
                                    sx={{
                                        bgcolor: "var(--secondary-color)",
                                        "&:hover": {
                                            bgcolor: "var(--primary-color)",
                                        },
                                    }}
                                >
                                    Next
                                </Button>
                            </Box>
                        </Box>
                    )}
                </Grid>
            </Grid>
        </Container>
    );
};

export default IndividualCheckout;
