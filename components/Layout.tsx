'use client'

import React, { ReactNode } from 'react';
import { Box, styled } from '@mui/material';
import NavBar from './NavBar';

interface LayoutProps {
  children: ReactNode;
  showNavbar?: boolean;
  fullWidth?: boolean;
  navbarStyle?: 'fixed' | 'static';
}

const StyledBox = styled(Box)({
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
});

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  showNavbar = true,
  fullWidth = false,
  navbarStyle = 'static' as const
}) => {
  return (
    <StyledBox>
      {showNavbar && (
        <Box 
          component="header" 
          sx={{ 
            position: navbarStyle,
            top: 0,
            left: 0,
            right: 0,
            zIndex: (theme) => theme.zIndex.drawer + 1 
          }}
        >
          {/* <NavBar /> */}
        </Box>
      )}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          marginTop: navbarStyle === 'fixed' ? '84px' : 0,
          ...(fullWidth && {
            width: '100%',
            maxWidth: 'none'
          })
        }}
      >
        {children}
      </Box>
    </StyledBox>
  );
};

export default Layout;