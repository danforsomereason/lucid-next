'use client'

import { useGlobal } from "@/context/globalContext";
import { checkUserExists, registerJoin } from "@/requests/users";
import { licenseTypeSchema } from "@/types";
import {
  Box,
  Button,
  Card,
  Container,
  FormControl,
  Grid2,
  InputLabel,
  Link,
  TextField,
  Typography
} from "@mui/material";
import { useRouter } from "next/navigation";
import React, { ChangeEvent, useEffect, useState } from "react";

const LICENSE_TYPES = [
  { label: "Mental Health Counselor (e.g., LPC, LMHC)", value: 'counseling' },
  { label: "Social Worker", value: 'social_work' },
  { label: "Licensed Drug and Alcohol Counselor (e.g., LADAC, LCDC)", value: 'addiction_counselor' },
  { label: "Nurse", value: 'nursing' },
  { label: "Psychologist", value: 'psychology' },
  { label: "MD, DO, NP, PA", value: 'physician' },
] as const;

export default function SignupJoin() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const [formData, setFormData] = useState({
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

  const global = useGlobal()

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
    setFormData((prev) => ({
      ...prev,
      licenseType: e.target.value,
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

  const handleNext = async () => {
    if (formErrors) return;

    const licenseType = licenseTypeSchema.parse(formData.licenseType);
    try {
      const output = await registerJoin(
        formData.firstName,
        formData.lastName,
        formData.email,
        licenseType,
        formData.password
      );
      localStorage.setItem("token", output.token);
      global.setCurrentUser(output.user);
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
      <Grid2 container spacing={4}>
        {/* Left side - Order Summary */}
        <Grid2 size={{ xs: 12, md: 4 }}>
          <Card sx={{ p: 3, bgcolor: "background.paper" }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 600 }}
            >
              Join Team
            </Typography>
          </Card>
        </Grid2>

        {/* Right side - Checkout Form */}

        <Grid2 size={{ xs: 12, md: 8 }}>
          <Box
            component="form"
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              handleNext();
            }}
          >
            <Grid2 container spacing={3}>
              <Grid2 size={{ xs: 12, sm: 6 }}>
                <TextField
                  required
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleTextFieldChange}
                  autoComplete="given-name"
                  sx={{
                    "& .MuiInputBase-root": {
                      height: "56px",
                    },
                    input: {
                      color: "var(--black-color)",
                      padding: "16.5px 14px",
                    },
                  }}
                />
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6 }}>
                <TextField
                  required
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleTextFieldChange}
                  autoComplete="family-name"
                  sx={{
                    "& .MuiInputBase-root": {
                      height: "56px",
                    },
                    input: {
                      color: "var(--black-color)",
                      padding: "16.5px 14px",
                    },
                  }}
                />
              </Grid2>
              <Grid2 size={{ xs: 12 }}>
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
                  sx={{
                    "& .MuiInputBase-root": {
                      height: "56px",
                    },
                    input: {
                      color: "var(--black-color)",
                      padding: "16.5px 14px",
                    },
                  }}
                />
              </Grid2>
              <Grid2 size={{ xs: 12 }}>
                <TextField
                  required
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleTextFieldChange}
                  autoComplete="new-password"
                  sx={{
                    "& .MuiInputBase-root": {
                      height: "56px",
                    },
                    input: {
                      color: "var(--black-color)",
                      padding: "16.5px 14px",
                    },
                  }}
                />
              </Grid2>
              <Grid2 size={{ xs: 12 }}>
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
                  sx={{
                    "& .MuiInputBase-root": {
                      height: "56px",
                    },
                    input: {
                      color: "var(--black-color)",
                      padding: "16.5px 14px",
                    },
                  }}
                />
              </Grid2>
              <Grid2 size={{ xs: 12 }}>
                <FormControl fullWidth required>
                  <InputLabel>License Type</InputLabel>
                  <select
                    value={formData.licenseType}
                    onChange={handleSelectChange}
                  >
                    <option value="" disabled>
                      Select a License Type
                    </option>
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
              </Grid2>
              {verificationMessage && (
                <Grid2 size={{ xs: 12 }}>
                  <Typography color="error">
                    {verificationMessage}
                  </Typography>
                </Grid2>
              )}
              {existingUserMessage && (
                <Typography color="primary" sx={{ mt: 1 }}>
                  {existingUserMessage}
                  <Link href="/login" sx={{ ml: 1 }}>
                    Sign in
                  </Link>
                </Typography>
              )}
            </Grid2>

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
        </Grid2>
      </Grid2>
    </Container>
  );
};
