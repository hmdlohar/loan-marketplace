import Avatar from "@mui/material/Avatar";
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
import { useRouter } from "next/router";
import { useMemo } from "react";
import { useQuery } from "react-query";
import PageContainer from "../../../components/common/PageContainer";
import CustomerAppLayout from "../../../layouts/app/CustomerAppLayout";
import CustomerAuthGuard from "../../../guards/CustomerAuthGuard";
import { bSdk } from "../../../services/BackendSDKService";
import { getFileProxyUrl } from "../../../services/fileProxyUtil";
import { buildRandomOffers, formatINR } from "../../../services/customerUtil";
import { trustShadowSx } from "../../../theme/styleHelpers";

const OffersPage: NextPage = () => {
  const router = useRouter();
  const applicationId = typeof router.query.applicationId === "string" ? router.query.applicationId : "";

  const applicationQuery = useQuery(
    ["application-offers", applicationId],
    async () => {
      const response = await bSdk.Applications_Get({ _id: applicationId });
      if (!response.status) {
        throw new Error(response.message || "Failed to load application.");
      }
      return response.data;
    },
    { enabled: !!applicationId }
  );

  const productsQuery = useQuery(["public-products-offers"], async () => {
    const response = await bSdk.Products_ListPublic({ page: 1, pageSize: 100 });
    if (!response.status) {
      throw new Error(response.message || "Failed to load products.");
    }
    return response.data;
  });

  const offers = useMemo(() => {
    const formData = applicationQuery.data?.FormData || {};
    const loanAmount = Number(formData.desiredLoanAmount || formData.loanAmount || 500000);
    const tenureMonths = Number(formData.loanTenure || 60);
    const lenders = (productsQuery.data?.items || [])
      .map((item: any) => ({
        name: item.Bank?.Name || item.Title,
        logoPath: item.Bank?.LogoPath,
      }))
      .filter((item: any, index: number, arr: any[]) => arr.findIndex((x) => x.name === item.name) === index);

    return buildRandomOffers({ lenders, loanAmount, tenureMonths });
  }, [applicationQuery.data, productsQuery.data]);

  return (
    <CustomerAuthGuard>
      <CustomerAppLayout>
        <PageContainer maxWidth="lg">
          <Typography variant="h4" component="h1" fontWeight={800} gutterBottom>
            Recommended offers
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Compare sample APR, EMI, and total repayment. Offers are illustrative while the matching engine is being built.
          </Typography>

          {!applicationId ? (
            <Typography color="error" sx={{ mb: 2 }}>
              Application ID is required.
            </Typography>
          ) : null}

          <Grid container spacing={2}>
            {offers.map((offer) => (
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
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar
                            src={offer.logoPath ? getFileProxyUrl(offer.logoPath) : undefined}
                            variant="rounded"
                            sx={{ width: 40, height: 40 }}
                          >
                            {offer.lenderName.charAt(0)}
                          </Avatar>
                          <Typography variant="h6">{offer.lenderName}</Typography>
                        </Stack>
                        {offer.recommended ? <Chip label="Best match" color="secondary" size="small" /> : null}
                      </Stack>
                      <Typography variant="h3" sx={{ fontVariantNumeric: "tabular-nums", fontWeight: 700, color: "primary.main" }}>
                        {offer.apr.toFixed(2)}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        APR (illustrative)
                      </Typography>
                      <Stack spacing={1}>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">
                            EMI
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {formatINR(offer.emi)}
                          </Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">
                            Total repayment
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
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

          <Box sx={{ mt: 4 }}>
            <Button variant="text" onClick={() => router.back()}>
              Back
            </Button>
          </Box>
        </PageContainer>
      </CustomerAppLayout>
    </CustomerAuthGuard>
  );
};

export default OffersPage;
