import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { NextPage } from "next";
import NextLink from "next/link";
import PageContainer from "../../components/common/PageContainer";
import AuthGuard from "../../guards/AuthGuard";
import AppLayout from "../../layouts/app/AppLayout";
import AuthServices from "../../services/AuthServices";
import {
  formatINR,
  getMockApplication,
  getStatusLabel,
} from "../../services/mock/applicationMock";

const DashboardPage: NextPage = () => {
  const application = getMockApplication();
  const userData = AuthServices.getUserData() as { FullName?: string; Mobile?: string } | null;

  return (
    <AuthGuard>
      <AppLayout>
        <PageContainer maxWidth="md">
          <Stack spacing={3}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                Application dashboard
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Track status and next steps for your active application.
              </Typography>
            </Box>
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                    <Typography variant="h6">Application {application.id}</Typography>
                    <Chip label={getStatusLabel(application.status)} color="warning" variant="outlined" />
                  </Stack>
                  <Divider />
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Applicant
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {userData?.FullName || "—"}
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Product
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {application.product.replace(/_/g, " ")}
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Loan amount
                      </Typography>
                      <Typography variant="body2" fontWeight={600} sx={{ fontVariantNumeric: "tabular-nums" }}>
                        {formatINR(application.loanAmount)}
                      </Typography>
                    </Stack>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Button component={NextLink} href="/app/offers" variant="contained" color="secondary">
                View offers
              </Button>
              <Button component={NextLink} href="/app/apply/documents" variant="outlined">
                Manage documents
              </Button>
              <Button
                variant="text"
                color="inherit"
                onClick={() => {
                  AuthServices.onLogout();
                  window.location.href = "/";
                }}
              >
                Sign out
              </Button>
            </Stack>
          </Stack>
        </PageContainer>
      </AppLayout>
    </AuthGuard>
  );
};

export default DashboardPage;
