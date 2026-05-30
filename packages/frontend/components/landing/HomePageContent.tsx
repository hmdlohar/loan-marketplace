import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import SpeedOutlinedIcon from "@mui/icons-material/SpeedOutlined";
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
import HeroSection from "./HeroSection";
import HowItWorksInfographic from "./HowItWorksInfographic";
import PartnerBankLogos from "./PartnerBankLogos";
import { footerSectionSx, iconWellSx, trustShadowSx } from "../../theme/styleHelpers";
import { lendingCoreTokens } from "../../theme/tokens";

const dark = lendingCoreTokens.colors.dark;

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


export default function HomePageContent() {
  return (
    <>
      <HeroSection />

      <PartnerBankLogos />

      <PageContainer pt={{ xs: 1, md: 1.5 }} pb={{ xs: 3, md: 4 }}>
        <HowItWorksInfographic />
      </PageContainer>

      <PageContainer>
        <Box id="products" sx={{ scrollMarginTop: { xs: 72, md: 96 }, py: { xs: 1, md: 2 } }}>
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
                    ...theme.applyStyles("dark", {
                      bgcolor: dark.surfaceContainerLow,
                      borderColor: "rgba(74, 225, 131, 0.14)",
                    }),
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
                      <Chip
                        label={product.apr}
                        color="secondary"
                        size="small"
                        variant="outlined"
                        sx={(theme) =>
                          theme.applyStyles("dark", {
                            borderColor: "rgba(74, 225, 131, 0.45)",
                            color: dark.secondary,
                          })
                        }
                      />
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

      <Box
        sx={(theme) => ({
          bgcolor: "background.paper",
          borderTop: 1,
          borderBottom: 1,
          borderColor: "divider",
          py: { xs: 5, md: 7 },
          ...theme.applyStyles("dark", {
            bgcolor: dark.surfaceContainerLow,
            borderColor: "rgba(182, 198, 240, 0.1)",
          }),
        })}
      >
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

      <Box sx={(theme) => ({ ...footerSectionSx(theme), py: { xs: 5, md: 6 }, mt: { xs: 2, md: 4 } })}>
        <PageContainer>
          <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems={{ md: "center" }} justifyContent="space-between">
            <Box>
              <Typography variant="h5" fontWeight={700} gutterBottom sx={{ fontSize: { xs: "1.25rem", md: "1.5rem" } }}>
                Ready to compare your options?
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 520, fontSize: { xs: "0.9375rem", md: "1rem" } }}>
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
              fullWidth
              sx={{ flexShrink: 0, width: { xs: "100%", md: "auto" } }}
            >
              Start your application
            </Button>
          </Stack>
        </PageContainer>
      </Box>
    </>
  );
}
