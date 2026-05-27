import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { NextPage } from "next";
import NextLink from "next/link";
import { APPLICATION_STATUS } from "commonlib";
import PageContainer from "../../../components/common/PageContainer";
import AuthGuard from "../../../guards/AuthGuard";
import AppLayout from "../../../layouts/app/AppLayout";
import { updateMockApplication } from "../../../services/mock/applicationMock";

const documents = [
  { name: "PAN card", status: "Verified" },
  { name: "Aadhaar", status: "Verified" },
  { name: "Salary slip (last 3 months)", status: "Pending" },
  { name: "Bank statement (6 months)", status: "Pending" },
];

const DocumentsPage: NextPage = () => {
  return (
    <AuthGuard>
      <AppLayout>
        <PageContainer maxWidth="md">
          <Typography variant="h4" component="h1" gutterBottom>
            Document upload
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Upload required documents for OCR verification. Mock UI — files are not sent anywhere yet.
          </Typography>
          <Stack spacing={2}>
            {documents.map((doc) => (
              <Card key={doc.name}>
                <CardContent>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {doc.name}
                      </Typography>
                      <Chip
                        size="small"
                        label={doc.status}
                        color={doc.status === "Verified" ? "success" : "warning"}
                        sx={{ mt: 1 }}
                      />
                    </Box>
                    <Button variant="outlined" startIcon={<CloudUploadOutlinedIcon />}>
                      Upload
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
          <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
            <Button
              component={NextLink}
              href="/app/matching"
              variant="contained"
              color="secondary"
              onClick={() => {
                updateMockApplication({ status: APPLICATION_STATUS.UNDER_REVIEW });
              }}
            >
              Submit for matching
            </Button>
            <Button component={NextLink} href="/app/apply" variant="outlined">
              Back to form
            </Button>
          </Stack>
        </PageContainer>
      </AppLayout>
    </AuthGuard>
  );
};

export default DocumentsPage;
