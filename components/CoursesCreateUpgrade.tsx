'use client'

import { UpgradeUserInput, upgradeUserInputSchema, upgradeUserOutputSchema, User } from "@/types";
import { Alert, Button, Container, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { useState } from "react";
import CreateCourseProvider from "./CreateCourseProvider";

export default function CoursesCreateUpgrade(props: {
  user: User
  users: User[]
}) {
  const [user, setUser] = useState<User>(props.user);
  const [userId, setUserId] = useState("");
  const items = props.users.map((user) => (
    <MenuItem key={user.id} value={user.id}>
      {user.firstName} {user.lastName}
    </MenuItem>
  ));
  if (user.role === "instructor" || user.role === "super_admin") {
    return <CreateCourseProvider />
  }
  return (
    <>
      <Container sx={{ mt: 4 }}>
        <Alert severity="warning">
          You must be classified as an instructor to create a course.
        </Alert>
      </Container>
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          const input: UpgradeUserInput = {
            userId: userId,
          }
          const parsed = upgradeUserInputSchema.parse(input);
          const json = JSON.stringify(parsed);
          const response = await fetch('/api/v1/users/upgrade', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: json,
          });
          const data = await response.json();
          console.log('data', data);
          const output = upgradeUserOutputSchema.parse(data);
          if (output.id === userId) {
            setUser(output);
          }
        }}
      >
        <FormControl fullWidth>
          <InputLabel>User</InputLabel>
          <Select
            label="User"
            value={userId}
            onChange={(event) => {
              setUserId(event.target.value);
            }}
            sx={{
              "& .MuiInputBase-root": {
                height: "56px",
              },
            }}
          >
            {items}
          </Select>
          <Button
            variant="contained"
            sx={{
              bgcolor: "var(--secondary-color)",
              "&:hover": {
                bgcolor: "var(--primary-color)",
              },
            }}
            type='submit'
          >
            Upgrade User
          </Button>
        </FormControl>
      </form>
    </>
  );
}
