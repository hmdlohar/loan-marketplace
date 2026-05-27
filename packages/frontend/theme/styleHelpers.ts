import type { Theme } from "@mui/material/styles";
import { lendingCoreTokens } from "./tokens";

const light = lendingCoreTokens.colors.light;
const dark = lendingCoreTokens.colors.dark;

export function trustShadowSx(theme: Theme) {
  return {
    boxShadow: lendingCoreTokens.shadow.trust,
    ...theme.applyStyles("dark", {
      boxShadow: lendingCoreTokens.shadow.trustDark,
    }),
  };
}

export function heroSectionSx(theme: Theme) {
  return {
    background: `linear-gradient(180deg, ${light.primaryFixed} 0%, ${light.background} 58%)`,
    ...theme.applyStyles("dark", {
      background: `linear-gradient(180deg, ${dark.onPrimary} 0%, ${dark.background} 62%)`,
    }),
  };
}

export function footerSectionSx(theme: Theme) {
  return {
    bgcolor: light.primary,
    color: light.onPrimary,
    ...theme.applyStyles("dark", {
      bgcolor: dark.primaryContainer,
      color: dark.onPrimaryContainer,
    }),
  };
}

export function iconWellSx(theme: Theme, tone: "primary" | "secondary" = "secondary") {
  if (tone === "primary") {
    return {
      bgcolor: light.primaryContainer,
      color: light.onPrimaryContainer,
      ...theme.applyStyles("dark", {
        bgcolor: dark.primaryContainer,
        color: dark.onPrimaryContainer,
      }),
    };
  }

  return {
    bgcolor: "rgba(0, 109, 55, 0.12)",
    color: light.secondary,
    ...theme.applyStyles("dark", {
      bgcolor: "rgba(74, 225, 131, 0.14)",
      color: dark.secondary,
    }),
  };
}
