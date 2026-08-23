'use client'

import { useGlobal } from "@/context/GlobalContext";
import { useUsers } from "@/context/UsersContext";
import { UpgradeUserInput, upgradeUserInputSchema, upgradeUserOutputSchema } from "@/types";
import { Button, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { useState } from "react";

export default function CoursesCreateUpgrade() {
  const global = useGlobal()
  const users = useUsers()
  const [selectedUserId, setSelectedUserId] = useState("");
  const items = users.rows.map((user) => (
    <MenuItem key={user.id} value={user.id}>
      {user.firstName} {user.lastName}
    </MenuItem>
  ));

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        const input: UpgradeUserInput = {
          userId: selectedUserId,
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
        const output = upgradeUserOutputSchema.parse(data);
        if (output.id === global.currentUser?.id) {
          global.setCurrentUser(output);
        }
      }}
    >
      <FormControl fullWidth>
        <InputLabel>User</InputLabel>
        <Select
          label="User"
          value={selectedUserId}
          onChange={(event) => {
            setSelectedUserId(event.target.value);
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
