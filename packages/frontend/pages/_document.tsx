import { Head, Html, Main, NextScript } from "next/document";
import { InitColorSchemeScript } from "@mui/material";
import { COLOR_MODE_STORAGE_KEY } from "../theme/lendingCoreTheme";

export default function AppDocument() {
  return (
    <Html lang="en" suppressHydrationWarning>
      <Head>
        <meta name="description" content="Loan marketplace — compare and apply for loans" />
        <meta name="color-scheme" content="light dark" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body>
        <InitColorSchemeScript attribute="data" defaultMode="light" modeStorageKey={COLOR_MODE_STORAGE_KEY} />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
