import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import type { AppProps } from "next/app";
import Head from "next/head";
import { QueryClientProvider } from "react-query";
import { queryClient } from "../services/ReactQueryClient";
import "../styles/globals.css";

const theme = createTheme({
  palette: {
    primary: { main: "#1565c0" },
    background: { default: "#f5f7fb" },
  },
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <Head>
          <title>Loan Marketplace</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <Component {...pageProps} />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
