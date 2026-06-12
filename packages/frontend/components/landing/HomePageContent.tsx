import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import SpeedOutlinedIcon from "@mui/icons-material/SpeedOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import NextLink from "next/link";
import PageContainer from "../common/PageContainer";
import ProductCard from "../customer/ProductCard";
import HeroSection from "./HeroSection";
import HowItWorksInfographic from "./HowItWorksInfographic";
import PartnerBankLogos from "./PartnerBankLogos";
import { footerSectionSx, iconWellSx, trustShadowSx } from "../../theme/styleHelpers";
import { lendingCoreTokens } from "../../theme/tokens";
import { useMarketplaceCatalog } from "../../services/useMarketplaceCatalog";

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

export default function HomePageContent() {
  const catalogQuery = useMarketplaceCatalog();
  const catalog = catalogQuery.data;

  return (
    <>
      <HeroSection
        lenderCount={catalog?.lenderCount}
        productCount={catalog?.productCount}
        loading={catalogQuery.isLoading}
      />

      <PartnerBankLogos banks={catalog?.banks} loading={catalogQuery.isLoading} />

      <PageContainer pt={{ xs: 1, md: 1.5 }} pb={{ xs: 3, md: 4 }}>
        <HowItWorksInfographic />
      </PageContainer>

      <PageContainer>
        <Box id="products" sx={{ scrollMarginTop: { xs: 72, md: 96 }, py: { xs: 1, md: 2 } }}>
          <Typography variant="h2" gutterBottom>
            Products we match
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 640 }}>
            Choose a loan type to browse live offers from our partner lenders. No account required to explore.
          </Typography>

          {catalogQuery.error ? (
            <Typography color="error" sx={{ mb: 3 }}>
              {(catalogQuery.error as Error).message}
            </Typography>
          ) : null}

          <Grid container spacing={2}>
            {catalogQuery.isLoading
              ? [1, 2, 3, 4, 5].map((item) => (
                  <Grid key={item} size={{ xs: 12, sm: 6, md: 4 }}>
                    <Skeleton variant="rounded" height={160} />
                  </Grid>
                ))
              : (catalog?.categories || []).map((category) => (
                  <Grid key={category.loanType} size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card
                      sx={(theme) => ({
                        height: "100%",
                        transition: "transform 0.2s, box-shadow 0.2s",
                        opacity: category.count ? 1 : 0.72,
                        ...theme.applyStyles("dark", {
                          bgcolor: dark.surfaceContainerLow,
                          borderColor: "rgba(74, 225, 131, 0.14)",
                        }),
                        "&:hover": category.count
                          ? {
                              transform: "translateY(-2px)",
                              ...trustShadowSx(theme),
                            }
                          : {},
                      })}
                    >
                      <CardActionArea
                        component={NextLink}
                        href={`/app/apply?type=${category.loanType}`}
                        disabled={!category.count}
                        sx={{ height: "100%" }}
                      >
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            {category.label}
                          </Typography>
                          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1.5 }}>
                            <Chip
                              label={category.count ? `${category.count} live offers` : "Coming soon"}
                              color={category.count ? "secondary" : "default"}
                              size="small"
                              variant="outlined"
                              sx={(theme) =>
                                theme.applyStyles("dark", {
                                  borderColor: category.count ? "rgba(74, 225, 131, 0.45)" : undefined,
                                  color: category.count ? dark.secondary : undefined,
                                })
                              }
                            />
                          </Stack>
                          <Typography variant="body2" color="text.secondary">
                            {category.description}
                          </Typography>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
          </Grid>
        </Box>
      </PageContainer>

      {(catalog?.featured || []).length ? (
        <PageContainer pb={{ xs: 4, md: 6 }}>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={2} sx={{ mb: 3 }}>
            <Box>
              <Typography variant="h2" gutterBottom>
                Featured offers
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Popular products you can apply for right now.
              </Typography>
            </Box>
            <Button component={NextLink} href="/app/apply" variant="outlined" endIcon={<ArrowForwardIcon />}>
              Apply now
            </Button>
          </Stack>
          <Grid container spacing={2}>
            {(catalog?.featured || []).map((product: any) => (
              <Grid key={product._id} size={{ xs: 12, md: 6, lg: 4 }}>
                <ProductCard product={product} />
              </Grid>
            ))}
          </Grid>
        </PageContainer>
      ) : null}

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
                Choose your loan type, upload documents once, and get matched to the best products for your profile.
              </Typography>
            </Box>
            <Button
              component={NextLink}
              href="/app/apply"
              variant="contained"
              color="secondary"
              size="large"
              endIcon={<ArrowForwardIcon />}
              fullWidth
              sx={{ flexShrink: 0, width: { xs: "100%", md: "auto" } }}
            >
              Apply for a loan
            </Button>
          </Stack>
        </PageContainer>
      </Box>
    </>
  );
}
