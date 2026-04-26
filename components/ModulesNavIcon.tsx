import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

interface ModulesNavIconProps {
  completed?: boolean
  locked?: boolean
}

export default function ModulesNavIcon({ completed, locked }: ModulesNavIconProps) {
  return (
    <>
      {completed ? (
        <CheckCircleIcon color="success" />
      ) : locked ? (
        <CancelIcon color="disabled" />
      ) : (
        <CheckCircleIcon color="disabled" />
      )}
    </>
  )
}