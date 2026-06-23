import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import { useQuery } from "react-query";
import PageContainer from "../../../components/common/PageContainer";
import CustomerAppLayout from "../../../layouts/app/CustomerAppLayout";
import AuthGuard from "../../../guards/AuthGuard";
import { bSdk } from "../../../services/BackendSDKService";
import { getFileProxyUrl } from "../../../services/fileProxyUtil";
import { formatINR, loanProductLabels } from "../../../services/customerUtil";
import { trustShadowSx } from "../../../theme/styleHelpers";

const RecommendationsPage: NextPage = () => (
  <AuthGuard login="otp">
    <RecommendationsPageContent />
  </AuthGuard>
);

function RecommendationsPageContent() {
  const router = useRouter();
  const applicationId = typeof router.query.applicationId === "string" ? router.query.applicationId : "";
  const [selectingId, setSelectingId] = useState("");
  const [error, setError] = useState("");

  const applicationQuery = useQuery(
    ["application-recommendations", applicationId],
    async () => {
      const response = await bSdk.Applications_Get({ _id: applicationId });
      if (!response.status) {
        throw new Error(response.message || "Failed to load application.");
      }
      return response.data;
    },
    { enabled: !!applicationId }
  );

  const recommendationsQuery = useQuery(
    ["application-recommendations-list", applicationId],
    async () => {
      const response = await bSdk.Applications_GetRecommendations({ ApplicationID: applicationId });
      if (!response.status) {
        throw new Error(response.message || "Failed to load recommendations.");
      }
      return response.data;
    },
    { enabled: !!applicationId }
  );

  const loanType = applicationQuery.data?.LoanType || "";

  return (
    <CustomerAppLayout>
        <PageContainer maxWidth="lg">
          <Stack spacing={1} sx={{ mb: 4 }}>
            <Typography variant="h4" component="h1" fontWeight={800}>
              Recommended for you
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Based on your {loanProductLabels[loanType] || "loan"} profile, these products have the highest approval
              likelihood.
            </Typography>
          </Stack>

          {recommendationsQuery.isLoading ? <LinearProgress /> : null}
          {recommendationsQuery.error ? (
            <Typography color="error">{(recommendationsQuery.error as Error).message}</Typography>
          ) : null}

          <Grid container spacing={3}>
            {(recommendationsQuery.data?.items || []).map((item: any) => {
              const product = item.Product;
              const bankName = product?.Bank?.Name || "Partner bank";
              const logoUrl = product?.Bank?.LogoPath ? getFileProxyUrl(product.Bank.LogoPath) : "";

              return (
                <Grid key={product._id} size={{ xs: 12, md: 4 }}>
                  <Card sx={(theme) => ({ height: "100%", ...trustShadowSx(theme) })}>
                    <CardContent>
                      <Stack spacing={2} sx={{ height: "100%" }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar src={logoUrl} alt={bankName} variant="rounded" sx={{ width: 48, height: 48 }}>
                            {bankName.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="overline" color="text.secondary">
                              {bankName}
                            </Typography>
                            <Typography variant="h6" fontWeight={700}>
                              {product.Title}
                            </Typography>
                          </Box>
                        </Stack>

                        <Chip
                          label={`${item.approvalScore}% approval likelihood`}
                          color="success"
                          variant="outlined"
                          size="small"
                          sx={{ alignSelf: "flex-start" }}
                        />

                        <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                          {item.reason}
                        </Typography>

                        <Stack spacing={0.5}>
                          {item.interestRate !== null && item.interestRate !== undefined ? (
                            <Stack direction="row" justifyContent="space-between">
                              <Typography variant="body2" color="text.secondary">
                                Interest rate
                              </Typography>
                              <Typography variant="body2" fontWeight={600}>
                                {item.interestRate}% p.a.
                              </Typography>
                            </Stack>
                          ) : null}
                          {item.emi ? (
                            <Stack direction="row" justifyContent="space-between">
                              <Typography variant="body2" color="text.secondary">
                                Monthly EMI
                              </Typography>
                              <Typography variant="body2" fontWeight={600}>
                                {formatINR(item.emi)}
                              </Typography>
                            </Stack>
                          ) : null}
                          {item.tenureMonths ? (
                            <Stack direction="row" justifyContent="space-between">
                              <Typography variant="body2" color="text.secondary">
                                Tenure
                              </Typography>
                              <Typography variant="body2" fontWeight={600}>
                                {item.tenureMonths} months
                              </Typography>
                            </Stack>
                          ) : null}
                          {item.totalRepayment ? (
                            <Stack direction="row" justifyContent="space-between">
                              <Typography variant="body2" color="text.secondary">
                                Total repayment
                              </Typography>
                              <Typography variant="body2" fontWeight={600}>
                                {formatINR(item.totalRepayment)}
                              </Typography>
                            </Stack>
                          ) : null}
                        </Stack>

                        <Typography variant="caption" color="text.secondary">
                          {product.ShortDescription}
                        </Typography>

                        <Button
                          variant="contained"
                          color="secondary"
                          fullWidth
                          disabled={selectingId === product._id}
                          onClick={async () => {
                            setSelectingId(product._id);
                            setError("");
                            try {
                              const response = await bSdk.Applications_SelectProduct({
                                ApplicationID: applicationId,
                                ProductID: product._id,
                              });
                              if (!response.status) {
                                throw new Error(response.message || "Failed to select product.");
                              }
                              router.push("/app/dashboard");
                            } catch (ex: any) {
                              setError(ex.response?.data?.message || ex.message || "Failed to select product.");
                            } finally {
                              setSelectingId("");
                            }
                          }}
                        >
                          {selectingId === product._id ? "Submitting..." : "Select this product"}
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {error ? (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          ) : null}
        </PageContainer>
    </CustomerAppLayout>
  );
}

export default RecommendationsPage;
