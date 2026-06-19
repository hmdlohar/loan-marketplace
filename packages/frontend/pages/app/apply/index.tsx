import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { APPLICATION_STATUS, LOAN_PRODUCT } from "commonlib";
import PageContainer from "../../../components/common/PageContainer";
import CustomerAppLayout from "../../../layouts/app/CustomerAppLayout";
import AuthGuard from "../../../guards/AuthGuard";
import { bSdk } from "../../../services/BackendSDKService";
import {
  loanProductDescriptions,
  loanProductLabels,
  loanProductOrder,
} from "../../../services/customerUtil";
import { trustShadowSx } from "../../../theme/styleHelpers";

const ApplyPage: NextPage = () => {
  const router = useRouter();
  const queryType = typeof router.query.type === "string" ? router.query.type : "";
  const [selectedType, setSelectedType] = useState<LOAN_PRODUCT | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (queryType && loanProductOrder.includes(queryType as LOAN_PRODUCT)) {
      setSelectedType(queryType as LOAN_PRODUCT);
    }
  }, [queryType]);

  const startApplication = async () => {
    if (!selectedType) {
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await bSdk.Applications_Save({
        LoanType: selectedType,
        Status: APPLICATION_STATUS.PENDING_DOCUMENTS,
        FormData: {},
      });
      if (!response.status || !response.data?._id) {
        throw new Error(response.message || "Failed to start application.");
      }
      router.push(`/app/apply/documents?applicationId=${response.data._id}`);
    } catch (ex: any) {
      setError(ex.response?.data?.message || ex.message || "Failed to start application.");
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (!selectedType || loading) {
      return;
    }
    startApplication();
  };

  return (
    <AuthGuard login="otp">
      <CustomerAppLayout>
        <PageContainer maxWidth="lg">
          <Stack spacing={4}>
          <Stack spacing={1}>
            <Typography variant="h3" component="h1" sx={{ fontSize: { xs: "2rem", md: "2.75rem" }, fontWeight: 800 }}>
              What kind of loan do you need?
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 720 }}>
              Choose a loan type to get started. We will ask for the right documents, pre-fill your details, and
              recommend the best products for you.
            </Typography>
          </Stack>

          <Grid container spacing={2}>
            {loanProductOrder.map((loanType) => {
              const active = selectedType === loanType;
              return (
                <Grid key={loanType} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Card
                    sx={(theme) => ({
                      height: "100%",
                      borderColor: active ? "secondary.main" : "divider",
                      ...(active ? trustShadowSx(theme) : {}),
                    })}
                  >
                    <CardActionArea
                      onClick={() => setSelectedType(loanType)}
                      sx={{ height: "100%" }}
                    >
                      <CardContent>
                        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                          {loanProductLabels[loanType]}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {loanProductDescriptions[loanType]}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {error ? <Typography color="error">{error}</Typography> : null}

          <Box>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              endIcon={<ArrowForwardIcon />}
              disabled={!selectedType || loading}
              onClick={handleContinue}
            >
              {loading ? "Starting..." : "Continue"}
            </Button>
          </Box>
          </Stack>
        </PageContainer>
      </CustomerAppLayout>
    </AuthGuard>
  );
};

export default ApplyPage;
