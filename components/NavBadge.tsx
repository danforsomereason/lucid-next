import { useGlobal } from "@/context/GlobalContext";
import { Badge, Typography } from "@mui/material";

export default function NavBadge() {
  const global = useGlobal();
  if (!global.currentUser) {
    throw new Error('User missing')
  }
  if (!global.currentUser.organization) {
    return (
      <Typography sx={{ color: "var(--white-color)" }}>
        {global.currentUser.firstName}

      </Typography>
    )
  }
  return (
    <>
      <Typography sx={{ color: "var(--white-color)" }}>
        {global.currentUser.firstName}
      </Typography>
      <Badge>
        [{global.currentUser.organization?.name},
        {' '}
        {global.currentUser?.role}]
      </Badge>
    </>
  )
}