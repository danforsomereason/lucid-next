'use client'

import BarChartIcon from "@mui/icons-material/BarChart";
import HomeIcon from "@mui/icons-material/Home";
import PeopleIcon from "@mui/icons-material/People";
import PersonIcon from "@mui/icons-material/Person";
import SchoolIcon from "@mui/icons-material/School";
import SettingsIcon from "@mui/icons-material/Settings";
import { Box } from "@mui/material";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import LaptopChromebookIcon from '@mui/icons-material/LaptopChromebook';
import Link from "next/link";
import { useGlobal } from "../context/globalContext";

const drawerWidth = 280;
const navbarHeight = 86;

interface SidebarProps {
  mobileOpen: boolean;
  handleDrawerToggle: () => void;
}

const Sidebar = ({
  mobileOpen,
  handleDrawerToggle,
}: SidebarProps) => {
  const context = useGlobal();
  const isAdmin = context?.currentUser?.role === 'admin'
  const isInstructorOrSuperAdmin = context?.currentUser?.role === 'instructor' || context?.currentUser?.role === 'super_admin'

  const userMenuItems = [
    { text: "Dashboard", icon: <HomeIcon />, path: "/dashboard" },
    {
      text: "My Courses",
      icon: <SchoolIcon />,
      path: "/dashboard/courses",
    },
    {
      text: "Progress",
      icon: <BarChartIcon />,
      path: "/dashboard/progress",
    },
    { text: "Profile", icon: <PersonIcon />, path: "/dashboard/profile" },
  ];

  const instructorMenuItems = [
    ...userMenuItems,
    { 
      text: "Create Course", 
      icon: <LaptopChromebookIcon />, 
      path: "/courses/create" 
    },
  ];

  const adminMenuItems = [
    ...userMenuItems,
    { text: "Users", icon: <PeopleIcon />, path: "/dashboard/users" },
    {
      text: "Settings",
      icon: <SettingsIcon />,
      path: "/dashboard/settings",
    },
  ];

  const menuItems = isAdmin 
    ? adminMenuItems 
    : isInstructorOrSuperAdmin 
    ? instructorMenuItems 
    : userMenuItems;

  const drawer = (
    <Box sx={{ mt: 6 }}>
      <List>
        {menuItems.map((item) => (
          <Link
            href={item.path}
            key={item.text}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <ListItem key={item.text} disablePadding>
              <ListItemButton>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          </Link>
        ))}
      </List>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
            top: `${navbarHeight}px`,
            height: `calc(100% - ${navbarHeight}px)`,
            zIndex: 1000,
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", sm: "block" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
            top: `${navbarHeight}px`,
            height: `calc(100% - ${navbarHeight}px)`,
            zIndex: 1000,
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};
export default Sidebar;