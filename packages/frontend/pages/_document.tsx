import { Head, Html, Main, NextScript } from "next/document";
import { InitColorSchemeScript } from "@mui/material";
import { APP_LOGO, APP_TAGLINE } from "commonlib";
import { COLOR_MODE_STORAGE_KEY } from "../theme/lendingCoreTheme";

export default function AppDocument() {
  return (
    <Html lang="en" suppressHydrationWarning>
      <Head>
        <meta name="description" content={APP_TAGLINE} />
        <meta name="color-scheme" content="light dark" />
        <link rel="icon" href={APP_LOGO.favicon} sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href={APP_LOGO.favicon32} />
        <link rel="icon" type="image/png" sizes="16x16" href={APP_LOGO.favicon16} />
        <link rel="apple-touch-icon" href={APP_LOGO.appleTouchIcon} />
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
