import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import SpeedOutlinedIcon from "@mui/icons-material/SpeedOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import NextLink from "next/link";
import PageContainer from "../common/PageContainer";
import { footerSectionSx, heroSectionSx, iconWellSx, trustShadowSx } from "../../theme/styleHelpers";
import { lendingCoreTokens } from "../../theme/tokens";

const features = [
  {
    icon: SpeedOutlinedIcon,
    title: "One application, many lenders",
    body: "Submit once and let our matching engine surface the best-fit offers from banks and NBFCs.",
  },
  {
    icon: ShieldOutlinedIcon,
    title: "Institutional-grade security",
    body: "Encrypted document handling, consent-first KYC, and audit-ready workflows built for regulated lending.",
  },
  {
    icon: CheckCircleOutlineIcon,
    title: "Transparent terms",
    body: "Compare APR, EMI, and total repayment side by side before you accept any offer.",
  },
];

const products = [
  { label: "Home Loan", apr: "From 8.4% APR", amount: "Up to ₹5 Cr" },
  { label: "LAP", apr: "From 9.1% APR", amount: "Up to ₹10 Cr" },
  { label: "Personal Loan", apr: "From 10.5% APR", amount: "Up to ₹25 L" },
  { label: "Working Capital", apr: "From 11.2% APR", amount: "Up to ₹2 Cr" },
  { label: "Credit Card", apr: "Rewards & lounge", amount: "Limit up to ₹5 L" },
];

const stats = [
  { value: "50+", label: "Partner lenders" },
  { value: "₹500Cr+", label: "Loans matched" },
  { value: "48 hrs", label: "Avg. offer turnaround" },
];

const steps = [
  "Choose your loan product",
  "Complete eligibility & upload documents",
  "Review matched offers",
  "Accept and track to disbursal",
];

export default function HomePageContent() {
  return (
    <>
      <Box sx={(theme) => ({ ...heroSectionSx(theme), py: { xs: 6, md: 10 } })}>
        <PageContainer>
          <Grid container spacing={6} alignItems="center">
            <Grid size={{ xs: 12, md: 7 }}>
              <Stack spacing={3}>
                <Chip label="Trusted loan marketplace" color="secondary" sx={{ alignSelf: "flex-start" }} />
                <Typography variant="h1" component="h1" sx={{ fontSize: { xs: "2rem", md: "3rem" }, maxWidth: 640 }}>
                  Find the right loan with confidence
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ fontSize: "1.125rem", maxWidth: 560, lineHeight: 1.75 }}>
                  Compare offers from leading lenders. One guided journey from eligibility to approval — engineered for
                  clarity at every step.
                </Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <Button
                    component={NextLink}
                    href="/app/products"
                    variant="contained"
                    color="secondary"
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                  >
                    Check eligibility
                  </Button>
                  <Button component={NextLink} href="/#how-it-works" variant="outlined" color="primary" size="large">
                    See how it works
                  </Button>
                </Stack>
                <Grid container spacing={2} sx={{ pt: 1 }}>
                  {stats.map((stat) => (
                    <Grid key={stat.label} size={{ xs: 4 }}>
                      <Typography variant="h4" sx={{ fontVariantNumeric: "tabular-nums", color: "primary.main" }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        {stat.label}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <Card sx={(theme) => ({ ...trustShadowSx(theme), bgcolor: "background.paper" })}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="overline" color="text.secondary">
                      Sample offer
                    </Typography>
                    <Chip icon={<VerifiedUserOutlinedIcon />} label="Pre-qualified" color="secondary" size="small" />
                  </Stack>
                  <Typography
                    variant="h3"
                    sx={{
                      fontVariantNumeric: "tabular-nums",
                      fontWeight: 700,
                      color: "primary.main",
                      mt: 1,
                    }}
                  >
                    8.65% APR
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Home loan · HDFC Bank
                  </Typography>
                  <Stack spacing={1.5} sx={{ mt: 2 }}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Loan amount
                      </Typography>
                      <Typography variant="body2" fontWeight={600} sx={{ fontVariantNumeric: "tabular-nums" }}>
                        ₹45,00,000
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        EMI (120 mo)
                      </Typography>
                      <Typography variant="body2" fontWeight={600} sx={{ fontVariantNumeric: "tabular-nums" }}>
                        ₹42,891
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Total repayment
                      </Typography>
                      <Typography variant="body2" fontWeight={600} sx={{ fontVariantNumeric: "tabular-nums" }}>
                        ₹51,46,920
                      </Typography>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </PageContainer>
      </Box>

      <PageContainer>
        <Box id="products" sx={{ scrollMarginTop: 96, py: 2 }}>
          <Typography variant="h2" gutterBottom>
            Products we match
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 640 }}>
            From home loans to working capital — select a product and we route you to the right lenders.
          </Typography>
          <Grid container spacing={2}>
            {products.map((product) => (
              <Grid key={product.label} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card
                  sx={(theme) => ({
                    height: "100%",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      ...trustShadowSx(theme),
                    },
                  })}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {product.label}
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1.5 }}>
                      <Chip label={product.apr} color="secondary" size="small" variant="outlined" />
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {product.amount} · verified partner lenders
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </PageContainer>

      <Box sx={{ bgcolor: "background.paper", borderTop: 1, borderBottom: 1, borderColor: "divider", py: 7 }}>
        <PageContainer>
          <Grid container spacing={4}>
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Grid key={feature.title} size={{ xs: 12, md: 4 }}>
                  <Stack spacing={2}>
                    <Box
                      sx={(theme) => ({
                        width: 48,
                        height: 48,
                        borderRadius: lendingCoreTokens.radius.md,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        ...iconWellSx(theme, "secondary"),
                      })}
                    >
                      <Icon fontSize="small" />
                    </Box>
                    <Typography variant="h6">{feature.title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                      {feature.body}
                    </Typography>
                  </Stack>
                </Grid>
              );
            })}
          </Grid>
        </PageContainer>
      </Box>

      <PageContainer>
        <Box id="how-it-works" sx={{ scrollMarginTop: 96, py: 2 }}>
          <Typography variant="h2" gutterBottom>
            How it works
          </Typography>
          <Stack spacing={2} sx={{ mt: 3, maxWidth: 720 }}>
            {steps.map((step, index) => (
              <Stack key={step} direction="row" spacing={2} alignItems="flex-start">
                <Box
                  sx={(theme) => ({
                    width: 36,
                    height: 36,
                    borderRadius: lendingCoreTokens.radius.full,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    flexShrink: 0,
                    ...iconWellSx(theme, "primary"),
                  })}
                >
                  {index + 1}
                </Box>
                <Typography variant="body1" sx={{ pt: 0.75, lineHeight: 1.6 }}>
                  {step}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Box>
      </PageContainer>

      <Box sx={(theme) => ({ ...footerSectionSx(theme), py: 6, mt: 4 })}>
        <PageContainer>
          <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems={{ md: "center" }} justifyContent="space-between">
            <Box>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                Ready to compare your options?
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 520 }}>
                Start with eligibility — no obligation. See matched offers before you commit.
              </Typography>
            </Box>
            <Button
              component={NextLink}
              href="/app/products"
              variant="contained"
              color="secondary"
              size="large"
              endIcon={<ArrowForwardIcon />}
              sx={{ flexShrink: 0 }}
            >
              Start your application
            </Button>
          </Stack>
        </PageContainer>
      </Box>
    </>
  );
}
