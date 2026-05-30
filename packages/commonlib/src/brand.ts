/** Single source of truth for product branding. Change `APP_NAME` to rename the app everywhere. */
export const APP_NAME = "CashPeCash";

export const APP_TAGLINE = "Compare and apply for loans";

export const APP_DESCRIPTION =
  "Compare loan offers from banks and NBFCs. Apply once, get matched to the right product.";

export const APP_PAGE_TITLE = `${APP_NAME} — ${APP_TAGLINE}`;

/**
 * Logo filename stem under `packages/frontend/public/brand/`.
 * Replace `{stem}-source.png`, then run `pnpm --filter frontend brand:icons`.
 */
export const APP_LOGO_STEM = "logo";

export const APP_LOGO_DIR = "/brand";

export const APP_LOGO = {
  source: `${APP_LOGO_DIR}/${APP_LOGO_STEM}-source.png`,
  sm: `${APP_LOGO_DIR}/${APP_LOGO_STEM}-32.png`,
  md: `${APP_LOGO_DIR}/${APP_LOGO_STEM}-64.png`,
  lg: `${APP_LOGO_DIR}/${APP_LOGO_STEM}-128.png`,
  xl: `${APP_LOGO_DIR}/${APP_LOGO_STEM}-192.png`,
  master: `${APP_LOGO_DIR}/${APP_LOGO_STEM}-512.png`,
  favicon: `${APP_LOGO_DIR}/favicon.ico`,
  favicon16: `${APP_LOGO_DIR}/favicon-16.png`,
  favicon32: `${APP_LOGO_DIR}/favicon-32.png`,
  appleTouchIcon: `${APP_LOGO_DIR}/apple-touch-icon.png`,
};

export type AppLogoSize = "sm" | "md" | "lg" | "xl";

export const APP_LOGO_BY_SIZE: Record<AppLogoSize, string> = {
  sm: APP_LOGO.sm,
  md: APP_LOGO.md,
  lg: APP_LOGO.lg,
  xl: APP_LOGO.xl,
};
