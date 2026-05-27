import { createTheme } from "@mui/material/styles";
import { lendingCoreTokens } from "./tokens";

const light = lendingCoreTokens.colors.light;
const dark = lendingCoreTokens.colors.dark;

export const COLOR_MODE_STORAGE_KEY = "lending-core-color-mode";

export const lendingCoreTheme = createTheme({
  cssVariables: {
    colorSchemeSelector: "data",
  },
  colorSchemes: {
    light: {
      palette: {
        mode: "light",
        primary: {
          main: light.primary,
          light: light.primaryContainer,
          dark: light.onPrimaryContainer,
          contrastText: light.onPrimary,
        },
        secondary: {
          main: light.secondary,
          light: light.secondaryContainer,
          dark: light.onSecondaryContainer,
          contrastText: light.onSecondary,
        },
        success: {
          main: light.secondary,
          light: light.secondaryContainer,
          dark: light.onSecondaryContainer,
          contrastText: light.onSecondary,
        },
        error: {
          main: light.error,
          light: light.errorContainer,
          dark: light.onErrorContainer,
        },
        warning: {
          main: light.tertiary,
          light: light.tertiaryContainer,
          dark: light.onTertiaryContainer,
        },
        background: {
          default: light.background,
          paper: light.surfaceContainerLowest,
        },
        text: {
          primary: light.onSurface,
          secondary: light.onSurfaceVariant,
        },
        divider: light.outlineVariant,
      },
    },
    dark: {
      palette: {
        mode: "dark",
        primary: {
          main: dark.primary,
          light: dark.primaryContainer,
          dark: dark.onPrimary,
          contrastText: dark.onPrimary,
        },
        secondary: {
          main: dark.secondary,
          light: dark.secondaryContainer,
          dark: dark.onSecondaryContainer,
          contrastText: dark.onSecondary,
        },
        success: {
          main: dark.secondary,
          light: dark.secondaryContainer,
          dark: dark.onSecondaryContainer,
          contrastText: dark.onSecondary,
        },
        error: {
          main: dark.error,
          light: dark.errorContainer,
          dark: dark.onErrorContainer,
        },
        warning: {
          main: dark.tertiary,
          light: dark.tertiaryContainer,
          dark: dark.onTertiaryContainer,
        },
        background: {
          default: dark.background,
          paper: dark.surfaceContainerLow,
        },
        text: {
          primary: dark.onSurface,
          secondary: dark.onSurfaceVariant,
        },
        divider: dark.outlineVariant,
      },
    },
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
    h1: {
      fontSize: "3rem",
      fontWeight: 700,
      lineHeight: 1.17,
      letterSpacing: "-0.02em",
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 600,
      lineHeight: 1.25,
      letterSpacing: "-0.01em",
    },
    h3: {
      fontSize: "1.5rem",
      fontWeight: 600,
      lineHeight: 1.33,
    },
    h4: {
      fontSize: "1.125rem",
      fontWeight: 600,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.5,
    },
    body2: {
      fontSize: "0.875rem",
      lineHeight: 1.43,
    },
    button: {
      fontWeight: 600,
      textTransform: "none",
    },
  },
  shape: {
    borderRadius: lendingCoreTokens.radius.md,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: (themeParam) => ({
        body: {
          backgroundColor: themeParam.vars.palette.background.default,
        },
      }),
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: lendingCoreTokens.radius.md,
          paddingLeft: 20,
          paddingRight: 20,
          boxShadow: "none",
        },
        contained: {
          boxShadow: lendingCoreTokens.shadow.trust,
        },
        containedSecondary: {
          "&:hover": {
            boxShadow: lendingCoreTokens.shadow.trust,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: lendingCoreTokens.radius.lg,
          border: "1px solid",
          borderColor: theme.vars.palette.divider,
          boxShadow: "none",
          backgroundImage: "none",
        }),
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
        colorSecondary: ({ theme }) => ({
          backgroundColor: "rgba(0, 109, 55, 0.12)",
          color: light.secondary,
          ...theme.applyStyles("dark", {
            backgroundColor: "rgba(74, 225, 131, 0.16)",
            color: dark.secondary,
          }),
        }),
      },
    },
    MuiAppBar: {
      defaultProps: {
        color: "inherit",
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: ({ theme }) => ({
          backgroundImage: "none",
          backgroundColor: theme.vars.palette.background.paper,
        }),
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: lendingCoreTokens.radius.md,
          fontSize: "1rem",
        },
      },
    },
  },
});
