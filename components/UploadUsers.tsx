import { Button } from "@mui/material";
import { useRef } from "react";

export default function UploadUsers(props: {
  setVerifiedUsers: (users: string[]) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <input
        ref={fileInputRef}
        style={{ display: "none" }}
        type="file"
        accept=".csv"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const text = event.target?.result as string;
              const users = text.split("\n").map((line) => line.trim()).filter((line) => line);
              props.setVerifiedUsers(users);
            };
            reader.readAsText(file);
          }
        }}
      />
      <Button
        variant="contained"
        type="button"
        onClick={() => {
          fileInputRef.current?.click();
        }}
        sx={{
          bgcolor: "var(--secondary-color)",
          "&:hover": {
            bgcolor: "var(--primary-color)",
          },
        }}
      >
        Upload Verified Users
      </Button>
    </>
  );
}