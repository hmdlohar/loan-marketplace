import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { NextPage } from "next";
import { USER_ROLE } from "commonlib";
import ApplicationReviewTable from "../../../components/applications/ApplicationReviewTable";
import PageContainer from "../../../components/common/PageContainer";
import AuthGuard from "../../../guards/AuthGuard";
import RoleGuard from "../../../guards/RoleGuard";
import PartnerLayout from "../../../layouts/partner/PartnerLayout";

const PartnerApplicationsPage: NextPage = () => (
  <AuthGuard>
    <RoleGuard roles={[USER_ROLE.PARTNER]}>
      <PartnerLayout>
        <PageContainer>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                Applications
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Review applications submitted for your products and progress their status.
              </Typography>
            </Box>
            <ApplicationReviewTable />
          </Stack>
        </PageContainer>
      </PartnerLayout>
    </RoleGuard>
  </AuthGuard>
);

export default PartnerApplicationsPage;
