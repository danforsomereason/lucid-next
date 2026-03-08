import { Box, BoxProps, Button, styled } from "@mui/material";

const DRAWER_WIDTH = 280;
const NAVBAR_HEIGHT = 84;


export const CourseTitle = styled(Box)(({ theme }) => ({
    padding: theme.spacing(3),
    borderBottom: `1px solid ${theme.palette.divider}`,
}));


export const HelpButton = styled(Button)(({ theme }) => ({
    position: "absolute",
    bottom: theme.spacing(3),
    left: theme.spacing(3),
}));

export const MainContent = styled(Box)(({ theme }) => ({
    marginLeft: DRAWER_WIDTH,
    height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
    position: "fixed",
    top: NAVBAR_HEIGHT,
    width: `calc(100% - ${DRAWER_WIDTH}px)`,
    display: "flex",
    flexDirection: "column",
    padding: theme.spacing(4),
    overflow: "hidden",
}));

export const ModuleContainer = styled(Box)({
    display: "flex",
    // minHeight: "100vh",
    minHeight: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
    backgroundColor: "#f5f5f5",
});

interface SectionItemProps extends BoxProps {
    isLocked?: boolean;
}

export const SectionItem = styled(Box, {
    shouldForwardProp: (prop) => prop !== "isLocked",
})<SectionItemProps>(({ theme, isLocked }) => ({
    padding: theme.spacing(2),
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
    cursor: isLocked ? "not-allowed" : "pointer",
    "&:hover": {
        backgroundColor: isLocked ? "transparent" : theme.palette.action.hover,
    },
    opacity: isLocked ? 0.5 : 1,
}));

export const ModulesSidebar = styled(Box)(({ theme }) => ({
    width: DRAWER_WIDTH,
    backgroundColor: theme.palette.background.paper,
    borderRight: `1px solid ${theme.palette.divider}`,
    top: NAVBAR_HEIGHT,
    // bottom: 0,
    left: 0,
    position: 'fixed',
    height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
}));
