'use client'
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#6B31B8',
    },
    secondary: {
      main: '#5E21AD',
    },
    background: {
      default: '#000000',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
  cssVariables: true,
});

export default theme;