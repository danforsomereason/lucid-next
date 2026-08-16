'use client'

import { Box } from "@mui/material";
import { ReactNode, useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { useGlobal } from "@/context/GlobalContext";
import { useRouter } from "next/navigation";

const drawerWidth = 280;

interface DashboardLayoutProps {
  children?: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const globalValue = useGlobal();
  const router = useRouter();

  useEffect(() => {
    if (!globalValue?.currentUser) {
      router.replace("/signin");
    }
  }, [globalValue?.currentUser, router]);

  if (!globalValue?.currentUser) {
    return null;
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        {children}
      </Box>
    </Box>
  );
};
export default DashboardLayout;