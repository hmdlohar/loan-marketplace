import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { NextPage } from "next";
import { USER_ROLE } from "commonlib";
import ApplicationReviewTable from "../../../components/applications/ApplicationReviewTable";
import PageContainer from "../../../components/common/PageContainer";
import AuthGuard from "../../../guards/AuthGuard";
import RoleGuard from "../../../guards/RoleGuard";
import AdminLayout from "../../../layouts/admin/AdminLayout";

const AdminApplicationsPage: NextPage = () => (
  <AuthGuard>
    <RoleGuard roles={[USER_ROLE.SYSTEM_ADMIN]}>
      <AdminLayout>
        <PageContainer>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                Applications
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Review submitted loan applications and progress their status.
              </Typography>
            </Box>
            <ApplicationReviewTable />
          </Stack>
        </PageContainer>
      </AdminLayout>
    </RoleGuard>
  </AuthGuard>
);

export default AdminApplicationsPage;
