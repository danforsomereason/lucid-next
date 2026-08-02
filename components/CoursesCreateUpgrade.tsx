'use client'

import { useGlobal } from "@/context/globalContext";
import { UpgradeUserInput, upgradeUserInputSchema, upgradeUserOutputSchema, User } from "@/types";
import { Button, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { useState } from "react";

export default function CoursesCreateUpgrade(props: {
  user: User
  users: User[]
}) {
  const global = useGlobal()
  const [userId, setUserId] = useState("");
  const items = props.users.map((user) => (
    <MenuItem key={user.id} value={user.id}>
      {user.firstName} {user.lastName}
    </MenuItem>
  ));

  return (
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
          global.setCurrentUser(output);
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
  );
}
