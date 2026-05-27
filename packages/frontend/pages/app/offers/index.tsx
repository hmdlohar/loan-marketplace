import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { NextPage } from "next";
import NextLink from "next/link";
import PageContainer from "../../../components/common/PageContainer";
import AuthGuard from "../../../guards/AuthGuard";
import AppLayout from "../../../layouts/app/AppLayout";
import { formatINR, getMockOffers, type MockOffer } from "../../../services/mock/applicationMock";
import { trustShadowSx } from "../../../theme/styleHelpers";

const OffersPage: NextPage = () => {
  const offers = getMockOffers();

  return (
    <AuthGuard>
      <AppLayout>
        <PageContainer>
          <Typography variant="h4" component="h1" gutterBottom>
            Recommended loan offers
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Compare APR, EMI, and total repayment. Select an offer to proceed to acceptance.
          </Typography>
          <Grid container spacing={2}>
            {offers.map((offer: MockOffer) => (
              <Grid key={offer.id} size={{ xs: 12, md: 4 }}>
                <Card
                  sx={(theme) => ({
                    height: "100%",
                    borderColor: offer.recommended ? "secondary.main" : undefined,
                    ...(offer.recommended ? trustShadowSx(theme) : {}),
                  })}
                >
                  <CardContent>
                    <Stack spacing={2}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Typography variant="h6">{offer.lenderName}</Typography>
                        {offer.recommended ? <Chip label="Best match" color="secondary" size="small" /> : null}
                      </Stack>
                      <Typography
                        variant="h3"
                        sx={{ fontVariantNumeric: "tabular-nums", fontWeight: 700, color: "primary.main" }}
                      >
                        {offer.apr.toFixed(2)}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        APR
                      </Typography>
                      <Stack spacing={1}>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">
                            EMI
                          </Typography>
                          <Typography variant="body2" fontWeight={600} sx={{ fontVariantNumeric: "tabular-nums" }}>
                            {formatINR(offer.emi)}
                          </Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">
                            Total repayment
                          </Typography>
                          <Typography variant="body2" fontWeight={600} sx={{ fontVariantNumeric: "tabular-nums" }}>
                            {formatINR(offer.totalRepayment)}
                          </Typography>
                        </Stack>
                      </Stack>
                      <Button
                        component={NextLink}
                        href="/app/dashboard"
                        variant={offer.recommended ? "contained" : "outlined"}
                        color="secondary"
                        fullWidth
                      >
                        Select offer
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </PageContainer>
      </AppLayout>
    </AuthGuard>
  );
};

export default OffersPage;
