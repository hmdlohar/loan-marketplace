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
import AuthGuard from "../../guards/AuthGuard";
import AuthServices from "../../services/AuthServices";
import { bSdk } from "../../services/BackendSDKService";
import { getFileProxyUrl } from "../../services/fileProxyUtil";
import { formatINR, loanProductLabels } from "../../services/customerUtil";

const statusLabels: Record<string, string> = {
  [APPLICATION_STATUS.CREATED]: "Draft",
  [APPLICATION_STATUS.PENDING_DOCUMENTS]: "Pending documents",
  [APPLICATION_STATUS.PENDING_FORM]: "Pending form",
  [APPLICATION_STATUS.UNDER_REVIEW]: "Choose product",
  [APPLICATION_STATUS.PARTNER_ASSIGNED]: "Submitted",
  [APPLICATION_STATUS.APPROVED]: "Approved",
  [APPLICATION_STATUS.REJECTED]: "Rejected",
  [APPLICATION_STATUS.DISBURSED]: "Disbursed",
};

const statusColor: Record<string, "default" | "warning" | "success" | "error" | "info"> = {
  [APPLICATION_STATUS.CREATED]: "default",
  [APPLICATION_STATUS.PENDING_DOCUMENTS]: "warning",
  [APPLICATION_STATUS.PENDING_FORM]: "warning",
  [APPLICATION_STATUS.UNDER_REVIEW]: "info",
  [APPLICATION_STATUS.PARTNER_ASSIGNED]: "success",
  [APPLICATION_STATUS.APPROVED]: "success",
  [APPLICATION_STATUS.REJECTED]: "error",
  [APPLICATION_STATUS.DISBURSED]: "success",
};

function getResumeHref(application: any) {
  if (
    application.Status === APPLICATION_STATUS.CREATED ||
    application.Status === APPLICATION_STATUS.PENDING_DOCUMENTS
  ) {
    return `/app/apply/documents?applicationId=${application._id}`;
  }
  if (application.Status === APPLICATION_STATUS.PENDING_FORM) {
    return `/app/apply/form?applicationId=${application._id}`;
  }
  if (application.Status === APPLICATION_STATUS.UNDER_REVIEW) {
    return `/app/apply/recommendations?applicationId=${application._id}`;
  }
  return "";
}

const DashboardPage: NextPage = () => (
  <AuthGuard login="otp">
    <DashboardPageContent />
  </AuthGuard>
);

function DashboardPageContent() {
  const userData = AuthServices.getUserData() as { FullName?: string; Mobile?: string } | null;

  const applicationsQuery = useQuery(["customer-applications"], async () => {
    const response = await bSdk.Applications_List({ page: 1, pageSize: 50 });
    if (!response.status) {
      throw new Error(response.message || "Failed to load applications.");
    }
    return response.data;
  });

  return (
    <CustomerAppLayout>
        <PageContainer maxWidth="md">
          <Stack spacing={3}>
            <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} gap={2}>
              <Box>
                <Typography variant="h4" component="h1" fontWeight={800} gutterBottom>
                  My applications
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Track status and next steps for {userData?.FullName || userData?.Mobile || "your account"}.
                </Typography>
              </Box>
              <Button component={NextLink} href="/app/apply" variant="contained" color="secondary">
                Apply for new loan
              </Button>
            </Stack>

            {applicationsQuery.isLoading ? <Typography>Loading applications...</Typography> : null}
            {applicationsQuery.error ? <Typography color="error">{(applicationsQuery.error as Error).message}</Typography> : null}

            {(applicationsQuery.data?.items || []).map((application: any) => {
              const loanAmount = Number(
                application.FormData?.desiredLoanAmount || application.FormData?.loanAmount || 0
              );
              const logoUrl = application.Bank?.LogoPath ? getFileProxyUrl(application.Bank.LogoPath) : "";
              const loanTypeLabel = loanProductLabels[application.LoanType || application.Product?.LoanType] || "Loan";
              const title = application.Product?.Title || loanTypeLabel;
              const resumeHref = getResumeHref(application);

              return (
                <Card key={application._id}>
                  <CardContent>
                    <Stack spacing={2}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={2}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar src={logoUrl} variant="rounded" sx={{ width: 48, height: 48 }}>
                            {(application.Bank?.Name || loanTypeLabel).charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="h6">{title}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {application.Bank?.Name ? `${application.Bank.Name} · ` : ""}
                              {loanTypeLabel}
                            </Typography>
                          </Box>
                        </Stack>
                        <Chip
                          label={statusLabels[application.Status] || application.Status}
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
                      {resumeHref ? (
                        <Button component={NextLink} href={resumeHref} variant="contained" color="secondary">
                          Continue application
                        </Button>
                      ) : null}
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
                      Start a new loan application — your saved documents and profile will speed up future applications.
                    </Typography>
                    <Button component={NextLink} href="/app/apply" variant="contained" color="secondary">
                      Apply for a loan
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            ) : null}
          </Stack>
        </PageContainer>
    </CustomerAppLayout>
  );
}

export default DashboardPage;
