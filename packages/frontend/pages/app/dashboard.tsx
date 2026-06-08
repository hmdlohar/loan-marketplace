import Avatar from "@mui/material/Avatar";
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
import { useQuery } from "react-query";
import { APPLICATION_STATUS } from "commonlib";
import PageContainer from "../../components/common/PageContainer";
import CustomerAppLayout from "../../layouts/app/CustomerAppLayout";
import CustomerAuthGuard from "../../guards/CustomerAuthGuard";
import AuthServices from "../../services/AuthServices";
import { bSdk } from "../../services/BackendSDKService";
import { getFileProxyUrl } from "../../services/fileProxyUtil";
import { formatINR, loanProductLabels } from "../../services/customerUtil";

const statusLabels: Record<APPLICATION_STATUS, string> = {
  [APPLICATION_STATUS.CREATED]: "Draft",
  [APPLICATION_STATUS.PENDING_DOCUMENTS]: "Pending documents",
  [APPLICATION_STATUS.UNDER_REVIEW]: "Under review",
  [APPLICATION_STATUS.PARTNER_ASSIGNED]: "Partner assigned",
  [APPLICATION_STATUS.APPROVED]: "Approved",
  [APPLICATION_STATUS.REJECTED]: "Rejected",
  [APPLICATION_STATUS.DISBURSED]: "Disbursed",
};

const statusColor: Record<string, "default" | "warning" | "success" | "error" | "info"> = {
  [APPLICATION_STATUS.CREATED]: "default",
  [APPLICATION_STATUS.PENDING_DOCUMENTS]: "warning",
  [APPLICATION_STATUS.UNDER_REVIEW]: "info",
  [APPLICATION_STATUS.PARTNER_ASSIGNED]: "info",
  [APPLICATION_STATUS.APPROVED]: "success",
  [APPLICATION_STATUS.REJECTED]: "error",
  [APPLICATION_STATUS.DISBURSED]: "success",
};

const DashboardPage: NextPage = () => {
  const userData = AuthServices.getUserData() as { FullName?: string; Mobile?: string } | null;

  const applicationsQuery = useQuery(["customer-applications"], async () => {
    const response = await bSdk.Applications_List({ page: 1, pageSize: 50 });
    if (!response.status) {
      throw new Error(response.message || "Failed to load applications.");
    }
    return response.data;
  });

  return (
    <CustomerAuthGuard>
      <CustomerAppLayout>
        <PageContainer maxWidth="md">
          <Stack spacing={3}>
            <Box>
              <Typography variant="h4" component="h1" fontWeight={800} gutterBottom>
                My applications
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Track status and next steps for {userData?.FullName || userData?.Mobile || "your account"}.
              </Typography>
            </Box>

            {applicationsQuery.isLoading ? <Typography>Loading applications...</Typography> : null}
            {applicationsQuery.error ? <Typography color="error">{(applicationsQuery.error as Error).message}</Typography> : null}

            {(applicationsQuery.data?.items || []).map((application: any) => {
              const loanAmount = Number(
                application.FormData?.desiredLoanAmount || application.FormData?.loanAmount || 0
              );
              const logoUrl = application.Bank?.LogoPath ? getFileProxyUrl(application.Bank.LogoPath) : "";

              return (
                <Card key={application._id}>
                  <CardContent>
                    <Stack spacing={2}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={2}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar src={logoUrl} variant="rounded" sx={{ width: 48, height: 48 }}>
                            {(application.Bank?.Name || "B").charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="h6">{application.Product?.Title || "Application"}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {application.Bank?.Name} · {loanProductLabels[application.Product?.LoanType] || "Loan"}
                            </Typography>
                          </Box>
                        </Stack>
                        <Chip
                          label={statusLabels[application.Status as APPLICATION_STATUS] || application.Status}
                          color={statusColor[application.Status] || "default"}
                          variant="outlined"
                        />
                      </Stack>
                      <Divider />
                      <Stack spacing={1}>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">
                            Application ID
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {application._id}
                          </Typography>
                        </Stack>
                        {loanAmount ? (
                          <Stack direction="row" justifyContent="space-between">
                            <Typography variant="body2" color="text.secondary">
                              Loan amount
                            </Typography>
                            <Typography variant="body2" fontWeight={600}>
                              {formatINR(loanAmount)}
                            </Typography>
                          </Stack>
                        ) : null}
                      </Stack>
                      <Stack direction="row" spacing={2} flexWrap="wrap">
                        {application.Status === APPLICATION_STATUS.PENDING_DOCUMENTS ? (
                          <Button
                            component={NextLink}
                            href={`/app/apply/documents?applicationId=${application._id}`}
                            variant="contained"
                            color="secondary"
                          >
                            Upload documents
                          </Button>
                        ) : null}
                        {application.Status === APPLICATION_STATUS.UNDER_REVIEW ? (
                          <Button
                            component={NextLink}
                            href={`/app/offers?applicationId=${application._id}`}
                            variant="contained"
                            color="secondary"
                          >
                            View offers
                          </Button>
                        ) : null}
                        {application.Product?.Slug ? (
                          <Button component={NextLink} href={`/app/products/${application.Product.Slug}`} variant="outlined">
                            View product
                          </Button>
                        ) : null}
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}

            {!applicationsQuery.isLoading && !(applicationsQuery.data?.items || []).length ? (
              <Card>
                <CardContent>
                  <Stack spacing={2} alignItems="flex-start">
                    <Typography variant="h6">No applications yet</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Browse products and apply — your saved profile will speed up future applications.
                    </Typography>
                    <Button component={NextLink} href="/app/products" variant="contained" color="secondary">
                      Browse products
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            ) : null}
          </Stack>
        </PageContainer>
      </CustomerAppLayout>
    </CustomerAuthGuard>
  );
};

export default DashboardPage;
