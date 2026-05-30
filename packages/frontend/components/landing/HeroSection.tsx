import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import VerifiedIcon from "@mui/icons-material/Verified";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import NextLink from "next/link";
import PageContainer from "../common/PageContainer";
import HeroIllustration from "./HeroIllustration";
import { heroSectionSx } from "../../theme/styleHelpers";
import { lendingCoreTokens } from "../../theme/tokens";

const light = lendingCoreTokens.colors.light;
const dark = lendingCoreTokens.colors.dark;

const stats = [
  { value: "50+", label: "Partner lenders" },
  { value: "₹500Cr+", label: "Loans matched" },
  { value: "48 hrs", label: "Avg. offer turnaround" },
];

function HeroStats() {
  return (
    <Grid container spacing={{ xs: 2, sm: 2 }} sx={{ pt: { xs: 0.5, md: 1 } }}>
      {stats.map((stat, index) => (
        <Grid key={stat.label} size={{ xs: index === 2 ? 12 : 6, sm: 4 }}>
          <Box
            sx={{
              px: { xs: 1, sm: 0 },
              py: { xs: 1.5, sm: 0 },
              borderRadius: 2,
              height: "100%",
            }}
          >
            <Typography
              variant="h4"
              sx={(theme) => ({
                fontVariantNumeric: "tabular-nums",
                fontSize: { xs: "1.5rem", sm: "2.125rem" },
                color: light.primary,
                ...theme.applyStyles("dark", { color: dark.secondaryFixed }),
              })}
            >
              {stat.value}
            </Typography>
            <Typography
              variant="caption"
              sx={(theme) => ({
                fontWeight: 600,
                display: "block",
                lineHeight: 1.4,
                mt: 0.5,
                color: light.onSurfaceVariant,
                ...theme.applyStyles("dark", { color: dark.primaryFixed, opacity: 0.88 }),
              })}
            >
              {stat.label}
            </Typography>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
}

function HeroTrustBadge() {
  return (
    <Box
      sx={(theme) => ({
        alignSelf: "flex-start",
        display: "inline-flex",
        alignItems: "center",
        gap: 1,
        px: 1.5,
        py: 0.75,
        borderRadius: 999,
        bgcolor: "rgba(107, 254, 156, 0.1)",
        border: "1px solid rgba(107, 254, 156, 0.28)",
        ...theme.applyStyles("dark", {
          bgcolor: "rgba(107, 254, 156, 0.12)",
          border: "1px solid rgba(107, 254, 156, 0.32)",
        }),
      })}
    >
      <VerifiedIcon
        sx={(theme) => ({
          fontSize: 18,
          color: light.secondary,
          ...theme.applyStyles("dark", { color: dark.secondaryFixed }),
        })}
      />
      <Typography
        component="span"
        sx={(theme) => ({
          fontSize: "0.75rem",
          fontWeight: 600,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          lineHeight: 1,
          color: light.secondary,
          ...theme.applyStyles("dark", { color: dark.secondaryFixed }),
        })}
      >
        Trusted by 50+ banks
      </Typography>
    </Box>
  );
}

function HeroCopy() {
  return (
    <Stack spacing={{ xs: 2.5, md: 3 }}>
      <HeroTrustBadge />

      <Typography
        variant="h1"
        component="h1"
        sx={(theme) => ({
          fontSize: { xs: "clamp(1.75rem, 7vw, 2rem)", md: "3rem" },
          maxWidth: 640,
          lineHeight: 1.15,
          color: light.primary,
          ...theme.applyStyles("dark", { color: dark.onBackground }),
        })}
      >
        Find the right loan with confidence
      </Typography>

      <Typography
        variant="body1"
        sx={(theme) => ({
          fontSize: { xs: "1rem", md: "1.125rem" },
          maxWidth: 560,
          lineHeight: 1.75,
          color: light.onSurfaceVariant,
          ...theme.applyStyles("dark", { color: dark.primaryFixed, opacity: 0.92 }),
        })}
      >
        Compare offers from leading lenders. One guided journey from eligibility to approval — engineered for clarity at
        every step.
      </Typography>
    </Stack>
  );
}

function HeroActions() {
  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ width: { xs: "100%", sm: "auto" } }}>
      <Button
        component={NextLink}
        href="/app/products"
        variant="contained"
        color="secondary"
        size="large"
        endIcon={<ArrowForwardIcon />}
        fullWidth
        sx={{ width: { sm: "auto" } }}
      >
        Check eligibility
      </Button>
      <Button
        component={NextLink}
        href="/#how-it-works"
        variant="outlined"
        color="primary"
        size="large"
        fullWidth
        sx={(theme) => ({
          width: { sm: "auto" },
          color: light.primary,
          borderColor: light.outlineVariant,
          "&:hover": {
            borderColor: light.primary,
            bgcolor: "rgba(3, 22, 54, 0.04)",
          },
          ...theme.applyStyles("dark", {
            color: dark.onBackground,
            borderColor: "rgba(216, 226, 255, 0.35)",
            "&:hover": {
              borderColor: "rgba(216, 226, 255, 0.55)",
              bgcolor: "rgba(255, 255, 255, 0.06)",
            },
          }),
        })}
      >
        See how it works
      </Button>
    </Stack>
  );
}

export default function HeroSection() {
  return (
    <Box
      sx={(theme) => ({
        pt: 0,
        pb: { xs: 0, md: 1 },
        overflow: "hidden",
        ...heroSectionSx(theme),
      })}
    >
      <Box
        sx={{
          display: { xs: "block", md: "none" },
          px: 2,
          pt: 2,
          pb: 4,
        }}
      >
        <Stack spacing={3}>
          <HeroCopy />
          <HeroIllustration />
          <HeroActions />
          <HeroStats />
        </Stack>
      </Box>

      <Box sx={{ display: { xs: "none", md: "block" } }}>
        <PageContainer pt={{ xs: 2, md: 2.5 }} pb={0}>
          <Grid container spacing={6} alignItems="center">
            <Grid size={7}>
              <Stack spacing={3}>
                <HeroCopy />
                <HeroActions />
                <HeroStats />
              </Stack>
            </Grid>
            <Grid size={5}>
              <HeroIllustration />
            </Grid>
          </Grid>
        </PageContainer>
      </Box>
    </Box>
  );
}
