import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import dynamic from "next/dynamic";
import { howItWorksSteps } from "../../config/howItWorksAnimations";
import { lottieWellSx } from "../../theme/styleHelpers";

const HowItWorksLottieArt = dynamic(() => import("./HowItWorksLottieArt"), { ssr: false });

function StepColumn(props: { step: (typeof howItWorksSteps)[number] }) {
  return (
    <Stack spacing={2.5} alignItems="center" textAlign="center" sx={{ height: "100%" }}>
      <Box
        sx={(theme) => ({
          width: { xs: 148, sm: 168, md: 188 },
          height: { xs: 148, sm: 168, md: 188 },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          ...lottieWellSx(theme),
        })}
      >
        <HowItWorksLottieArt src={props.step.lottie} step={props.step.step} />
      </Box>
      <Box sx={{ maxWidth: 260 }}>
        <Typography variant="h6" gutterBottom sx={{ lineHeight: 1.35 }}>
          {props.step.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
          {props.step.body}
        </Typography>
      </Box>
    </Stack>
  );
}

export default function HowItWorksInfographic() {
  return (
    <Box
      id="how-it-works"
      sx={(theme) => ({
        scrollMarginTop: { xs: 72, md: 96 },
        pt: { xs: 2, md: 2.5 },
        pb: { xs: 3, md: 4 },
        px: { xs: 1.5, md: 4 },
        borderRadius: 3,
        background: "linear-gradient(180deg, rgba(216, 226, 255, 0.55) 0%, rgba(247, 249, 251, 0.2) 100%)",
        ...theme.applyStyles("dark", {
          background: `linear-gradient(180deg, rgba(54, 70, 105, 0.55) 0%, rgba(7, 27, 59, 0.35) 100%)`,
          border: "1px solid rgba(182, 198, 240, 0.1)",
        }),
      })}
    >
      <Stack spacing={0.75} sx={{ mb: { xs: 2, md: 2.5 }, maxWidth: 720, mx: "auto", textAlign: "center" }}>
        <Typography variant="h2" sx={{ mb: 0 }}>
          How it works
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 0 }}>
          Four steps from product selection to disbursal — one application, multiple lender matches.
        </Typography>
      </Stack>

      <Grid container spacing={{ xs: 4, md: 2, lg: 3 }} justifyContent="center">
        {howItWorksSteps.map((step) => (
          <Grid key={step.step} size={{ xs: 12, sm: 6, lg: 3 }}>
            <StepColumn step={step} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
