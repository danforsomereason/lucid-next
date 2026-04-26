import { Typography } from "@mui/material";
import ModulesNavIcon from "./ModulesNavIcon";
import { ReactNode } from "react";

interface ModulesNavLabelProps {
  children: ReactNode
  completed?: boolean
  locked?: boolean
}

export default function ModulesNavLabel ({
  children, completed, locked
}: ModulesNavLabelProps) {
  return (
    <>
      <ModulesNavIcon completed={completed} locked={locked} />
      <Typography
        color={
          locked ? "text.disabled" : "text.primary"
        }
      >
        {children}
      </Typography>
    </>
  )
}