import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { NextPage } from "next";
import NextLink from "next/link";
import PageContainer from "../../components/common/PageContainer";
import AuthGuard from "../../guards/AuthGuard";
import AppLayout from "../../layouts/app/AppLayout";

const MatchingPage: NextPage = () => {
  return (
    <AuthGuard>
      <AppLayout>
        <PageContainer maxWidth="sm">
          <Stack spacing={3} alignItems="center" textAlign="center" sx={{ py: 6 }}>
            <CircularProgress size={56} color="secondary" />
            <Box>
              <Typography variant="h4" gutterBottom>
                Finding your matches
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Our engine is evaluating your profile against partner eligibility rules. This usually takes under a
                minute.
              </Typography>
            </Box>
            <Button component={NextLink} href="/app/offers" variant="contained" color="secondary" size="large">
              View recommended offers
            </Button>
          </Stack>
        </PageContainer>
      </AppLayout>
    </AuthGuard>
  );
};

export default MatchingPage;
