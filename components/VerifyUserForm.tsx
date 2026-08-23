'use client'

import { verifyUserInputSchema } from "@/types"
import { Button, TextField } from "@mui/material"
import axios from "axios"
import { useState } from "react"

export default function VerifyUserForm() {
  const [email, setEmail] = useState('')

  return (
    <form
      style={{ display: 'flex', gap: '1rem' }}
      onSubmit={async (e) => {
        e.preventDefault()
        const inputData = { email }
        const input = verifyUserInputSchema.parse(inputData)
        const body = JSON.stringify(input)
        const response = await axios.post(
          '/api/v1/users/verify',
          body,
        )
      }}
    >
      <TextField
        required
        fullWidth
        label="Email Address"
        name="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
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
        Submit
      </Button>
    </form>
  )
}