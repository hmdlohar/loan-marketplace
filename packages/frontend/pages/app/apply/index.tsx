import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import type { NextPage } from "next";
import NextLink from "next/link";
import { APPLICATION_STATUS, EMPLOYMENT_TYPE } from "commonlib";
import PageContainer from "../../../components/common/PageContainer";
import AuthGuard from "../../../guards/AuthGuard";
import AppLayout from "../../../layouts/app/AppLayout";
import { getMockApplication, updateMockApplication } from "../../../services/mock/applicationMock";

const ApplyPage: NextPage = () => {
  const application = getMockApplication();

  return (
    <AuthGuard>
      <AppLayout>
        <PageContainer maxWidth="md">
          <Typography variant="h4" component="h1" gutterBottom>
            Loan eligibility
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Tell us about your requirements. Product: <strong>{application.product.replace(/_/g, " ")}</strong>
          </Typography>
          <Box component="form">
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField label="Required loan amount (₹)" defaultValue={application.loanAmount} fullWidth />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField label="Preferred tenure (months)" defaultValue={120} fullWidth />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField label="Monthly income (₹)" defaultValue={125000} fullWidth />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField select label="Employment type" defaultValue={EMPLOYMENT_TYPE.SALARIED} fullWidth>
                  <MenuItem value={EMPLOYMENT_TYPE.SALARIED}>Salaried</MenuItem>
                  <MenuItem value={EMPLOYMENT_TYPE.SELF_EMPLOYED_PROFESSIONAL}>Self employed (professional)</MenuItem>
                  <MenuItem value={EMPLOYMENT_TYPE.SELF_EMPLOYED_BUSINESS}>Self employed (business)</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField label="City" defaultValue="Mumbai" fullWidth />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField label="Property value (₹)" defaultValue={8500000} fullWidth />
              </Grid>
            </Grid>
            <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
              <Button
                component={NextLink}
                href="/app/apply/documents"
                variant="contained"
                color="secondary"
                onClick={() => {
                  updateMockApplication({ status: APPLICATION_STATUS.PENDING_DOCUMENTS });
                }}
              >
                Save & upload documents
              </Button>
              <Button component={NextLink} href="/app/products" variant="outlined">
                Back to products
              </Button>
            </Stack>
          </Box>
        </PageContainer>
      </AppLayout>
    </AuthGuard>
  );
};

export default ApplyPage;
