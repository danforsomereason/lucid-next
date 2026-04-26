import { TextField, TextFieldProps } from "@mui/material";

export default function LucidInput(props: TextFieldProps) {
  const sx = {
    "& .MuiInputBase-root": {
      height: "56px",
    },
    input: {
      color: "var(--black-color)",
      padding: "16.5px 14px",
    },
    "& .MuiInputBase-inputMultiline": {
      padding: "16.5px 14px",
      height: "auto",
    },
    ...props.sx,
  }
  return (
    <TextField
      {...props}
      sx={sx}
    />
  )
}