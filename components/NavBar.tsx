'use client'

import MenuIcon from "@mui/icons-material/Menu";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import Popover from "@mui/material/Popover";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useGlobal } from "../context/globalContext";

const NavBar: React.FC = () => {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const context = useGlobal();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) {
    return <></>
  }
  // need to get the token out of the context as opposed to the localStorage
  const userName =
    context?.currentUser?.firstName || "You are not logged in.";

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    // should also be reset in the context to be undefined
    localStorage.removeItem("token");
    handleMenuClose();
    router.push("/");
  };

  const publicMenuItems = [
    { label: "Home", path: "/" },
    { label: "Membership", path: "/membership" },
    { label: "Courses", path: "/courses" },
  ];

  const authenticatedMenuItems = [
    { label: "Home", path: "/" },
    { label: "Dashboard", path: "/dashboard" },
    { label: "Courses", path: "/courses" },
  ];

  const menuItems = context?.currentUser ? authenticatedMenuItems : publicMenuItems;

  return (
    <AppBar
      position="static"
      sx={{ backgroundColor: "var(--black-color)", padding: "10px 20px" }}
    >
      <Toolbar
        style={{ display: "flex", justifyContent: "space-between" }}
      >
        <Typography
          variant="h4"
          onClick={() => {
            router.push("/");
          }}
          sx={{
            color: "var(--secondary-color)",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          LUCID
        </Typography>

        {!context?.currentUser ? (
          <>
            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                alignItems: "center",
                gap: "75px",
                color: "var(--white-color)",
                border: "1px solid hsl(0, 0%, 20%)",
                padding: "10px 20px",
                borderRadius: "5px",
                backgroundColor: "hsl(0, 0%, 12%)",
              }}
            >
              {menuItems.map((item) => (
                <Typography
                  key={item.path}
                  variant="body1"
                  onClick={() => router.push(item.path)}
                  sx={{ cursor: "pointer" }}
                >
                  {item.label}
                </Typography>
              ))}
            </Box>
            {/* Sign in button for not-signed-in user */}
            <Button
              variant="contained"
              color="secondary"
              onClick={() => router.push("/signin")}
              sx={{ display: { xs: "none", md: "block" } }}
            >
              Sign In
            </Button>
          </>
        ) : (
          // User info and menu button when logged in
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography sx={{ color: "var(--white-color)" }}>
              {userName}
            </Typography>
            <IconButton color="inherit" onClick={handleMenuOpen}>
              <MenuIcon />
            </IconButton>
          </Box>
        )}

        {/* Mobile menu button - Only show when not logged in */}
        {!context?.currentUser && (
          <IconButton
            color="inherit"
            onClick={handleMenuOpen}
            sx={{ display: { xs: "block", md: "none" } }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Menu (for both mobile and logged-in users) */}
        {mounted && typeof window !== 'undefined' && (
          <Popover
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            disableScrollLock
          >
            <MenuList>
            {menuItems.map((item) => (
              <MenuItem
                key={item.path}
                onClick={() => {
                  router.push(item.path);
                  handleMenuClose();
                }}
              >
                {item.label}
              </MenuItem>
            ))}
            {context?.currentUser ? (
              <MenuItem onClick={handleLogout}>Sign Out</MenuItem>
            ) : (
              <MenuItem
                onClick={() => {
                  router.push("/signin");
                  handleMenuClose();
                }}
              >
                Sign In
              </MenuItem>
            )}
            </MenuList>
          </Popover>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
