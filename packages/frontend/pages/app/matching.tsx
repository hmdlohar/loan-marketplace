import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { NextPage } from "next";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import PageContainer from "../../components/common/PageContainer";
import CustomerAppLayout from "../../layouts/app/CustomerAppLayout";
import CustomerAuthGuard from "../../guards/CustomerAuthGuard";
import { bSdk } from "../../services/BackendSDKService";

const MatchingPage: NextPage = () => {
  const router = useRouter();
  const applicationId = typeof router.query.applicationId === "string" ? router.query.applicationId : "";
  const [ready, setReady] = useState(false);

  const applicationQuery = useQuery(
    ["application-matching", applicationId],
    async () => {
      const response = await bSdk.Applications_Get({ _id: applicationId });
      if (!response.status) {
        throw new Error(response.message || "Failed to load application.");
      }
      return response.data;
    },
    { enabled: !!applicationId }
  );

  useEffect(() => {
    if (!applicationId) {
      return;
    }
    const timer = window.setTimeout(() => {
      setReady(true);
    }, 1800);
    return () => window.clearTimeout(timer);
  }, [applicationId]);

  return (
    <CustomerAuthGuard>
      <CustomerAppLayout>
        <PageContainer maxWidth="sm">
          <Stack spacing={3} alignItems="center" textAlign="center" sx={{ py: 6 }}>
            {!ready ? <CircularProgress size={56} color="secondary" /> : null}
            <Box>
              <Typography variant="h4" fontWeight={800} gutterBottom>
                Finding your matches
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Our engine is evaluating your profile against partner eligibility rules. This usually takes under a minute.
              </Typography>
            </Box>
            {applicationQuery.data?.Product?.Title ? (
              <Chip label={applicationQuery.data.Product.Title} color="secondary" variant="outlined" />
            ) : null}
            <Button
              component={ready ? NextLink : "button"}
              href={ready ? `/app/offers?applicationId=${applicationId}` : undefined}
              variant="contained"
              color="secondary"
              size="large"
              disabled={!ready || !applicationId}
            >
              View recommended offers
            </Button>
            {!applicationId ? (
              <Button component={NextLink} href="/app/dashboard" variant="text">
                Back to dashboard
              </Button>
            ) : null}
          </Stack>
        </PageContainer>
      </CustomerAppLayout>
    </CustomerAuthGuard>
  );
};

export default MatchingPage;
