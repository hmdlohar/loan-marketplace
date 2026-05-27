import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import type { AppProps } from "next/app";
import Head from "next/head";
import { QueryClientProvider } from "react-query";
import { queryClient } from "../services/ReactQueryClient";
import { COLOR_MODE_STORAGE_KEY, lendingCoreTheme } from "../theme/lendingCoreTheme";
import "../styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={lendingCoreTheme} defaultMode="light" modeStorageKey={COLOR_MODE_STORAGE_KEY}>
      <CssBaseline enableColorScheme />
      <QueryClientProvider client={queryClient}>
        <Head>
          <title>LendingCore — Loan Marketplace</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <Component {...pageProps} />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
