'use client'

import React, { useState } from "react";
import { Button, TextField, Typography, Box, Link } from "@mui/material";
import { useRouter } from "next/navigation";
import { useGlobal } from "@/context/globalContext";
import { login } from "@/requests/users";

interface SignUpFormData {
    email: string;
    password: string;
}

const SignIn: React.FC = () => {
    // navigate to the dashboard page after successful login
    const router = useRouter();
    const globalValue = useGlobal();
    // Create a state to store the form data
    // SignUpFormData is an interface that defines the shape of the form data, so the angle brackets are used to create a state of that type
    // Iniitially, the form data is an empty object with empty strings for both fields
    // Remember, that as a user types in the form, the state is updated and the component is re-rendered
    const [formData, setFormData] = useState<SignUpFormData>({
        email: "",
        password: "",
    });

    // Create a state to store an error message
    const [error, setError] = useState<string>("");

    // Function to handle the sign in process
    const handleSignIn = async () => {
        // Attempting to login with the provided email and password

        // Call the login function imported from requests/user.ts
        // This is an async operation that returns a Promise, so we use await
        // We pass the email and password from our form state as arguments
        const response = await login(formData.email, formData.password);
        // if there is a global value, call the setCurrentUser
        globalValue?.setCurrentUser(response.user);
        // After successful login, use the navigate function from react-router-dom
        // to programmatically redirect the user to the dashboard page
        // The navigate function accepts a path string as an argument
        // In App.tsx, the dashboard path is defined as "/dashboard"
        router.push("/dashboard");
    };

    // Function to handle the change in the form fields
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // name here is the name of the input field, value is the value of the input field
        // for instance, instead of saying const name = e.target.name and const value = e.target.value,we can say const { name, value } = e.target;
        const { name, value } = e.target;
        setError("");
        // Update corresponding field in the form data
        // prev is the previous state, we spread it to keep the other fields the same and then update the field that changed
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100vh",
                padding: "0 20px",
                backgroundColor: "var(--white-color)",
                color: "var(--black-color)",
            }}
        >
            <Box
                sx={{
                    width: "100%",
                    maxWidth: "400px",
                    textAlign: "center",
                    backgroundColor: "hsl(0, 0%, 98%)",
                    padding: "40px",
                    borderRadius: "10px",
                    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                }}
            >
                <Link
                    onClick={() => {
                        router.push("/");
                    }}
                    variant="h4"
                    sx={{
                        marginBottom: "20px",
                        color: "var(--secondary-color)",
                        fontSize: "2.75rem",
                        fontWeight: "bold",
                        cursor: "pointer",
                        textDecoration: "none",
                    }}
                >
                    LUCID
                </Link>

                <TextField
                    label="Email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    variant="outlined"
                    fullWidth
                    sx={{
                        marginBottom: "20px",
                        backgroundColor: "white",
                        "& .MuiInputBase-root": {
                            height: "56px",
                        },
                        input: { 
                            color: "var(--black-color)",
                            padding: "16.5px 14px",
                        },
                        label: { color: "var(--black-color)" },
                        "& .MuiOutlinedInput-root": {
                            "& fieldset": {
                                borderColor: "var(--primary-color)",
                            },
                            "&:hover fieldset": {
                                borderColor: "var(--secondary-color)",
                            },
                            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                        },
                    }}
                />

                <TextField
                    label="Password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    variant="outlined"
                    fullWidth
                    sx={{
                        marginBottom: "20px",
                        backgroundColor: "white",
                        "& .MuiInputBase-root": {
                            height: "56px",
                        },
                        input: { 
                            color: "var(--black-color)",
                            padding: "16.5px 14px",
                        },
                        label: { color: "var(--black-color)" },
                        "& .MuiOutlinedInput-root": {
                            "& fieldset": {
                                borderColor: "var(--primary-color)",
                            },
                            "&:hover fieldset": {
                                borderColor: "var(--secondary-color)",
                            },
                            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                        },
                    }}
                />
                {error && (
                    <Typography sx={{ color: "red" }}>{error}</Typography>
                )}
                <Button
                    onClick={handleSignIn}
                    variant="contained"
                    fullWidth
                    sx={{
                        padding: "15px 30px",
                        backgroundColor: "var(--secondary-color)",
                        color: "var(--white-color)",
                        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                        "&:hover": {
                            backgroundColor: "var(--primary-color)",
                        },
                    }}
                >
                    Sign In
                </Button>

                <Typography
                    variant="body1"
                    sx={{ marginTop: "20px", color: "var(--black-color)" }}
                >
                    Don’t have an account?{" "}
                    <Link
                        onClick={() => {
                            router.push("/signup");
                        }}
                        sx={{
                            textDecoration: "none",
                            color: "var(--secondary-color)",
                            cursor: "pointer",
                            fontWeight: "bold",
                            "&:hover": {
                                color: "var(--primary-color)",
                            },
                        }}
                    >
                        Sign Up
                    </Link>
                </Typography>
            </Box>
        </Box>
    );
};

export default SignIn;
