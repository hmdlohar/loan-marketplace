import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import type { AppProps } from "next/app";
import Head from "next/head";
import { QueryClientProvider } from "react-query";
import { APP_LOGO, APP_PAGE_TITLE } from "commonlib";
import { queryClient } from "../services/ReactQueryClient";
import { COLOR_MODE_STORAGE_KEY, lendingCoreTheme } from "../theme/lendingCoreTheme";
import "../styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={lendingCoreTheme} defaultMode="light" modeStorageKey={COLOR_MODE_STORAGE_KEY}>
      <CssBaseline enableColorScheme />
      <QueryClientProvider client={queryClient}>
        <Head>
          <title>{APP_PAGE_TITLE}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href={APP_LOGO.favicon} sizes="any" />
          <link rel="icon" type="image/png" sizes="32x32" href={APP_LOGO.favicon32} />
          <link rel="icon" type="image/png" sizes="16x16" href={APP_LOGO.favicon16} />
          <link rel="apple-touch-icon" href={APP_LOGO.appleTouchIcon} />
        </Head>
        <Component {...pageProps} />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
