import GlobalProvider from '@/components/GlobalProvider';
import authenticate from '@/utils/authenticate';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import type { Metadata } from "next";
import { ThemeProvider } from "@mui/material/styles";
import theme from "@/theme";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import '../styles/global.css';

export const metadata: Metadata = {
  title: "Lucid",
  description: "Lucid",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentUser = await authenticate(true)
  console.log('currentUser', currentUser)
  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <GlobalProvider currentUser={currentUser}>
            <ThemeProvider theme={theme}>
              {children}
            </ThemeProvider>
          </GlobalProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
