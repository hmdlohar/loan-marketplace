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
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "react-query";
import { APPLICATION_STATUS, DOCUMENT_TYPE } from "commonlib";
import PageContainer from "../../../components/common/PageContainer";
import CustomerAppLayout from "../../../layouts/app/CustomerAppLayout";
import CustomerAuthGuard from "../../../guards/CustomerAuthGuard";
import { bSdk } from "../../../services/BackendSDKService";

const requiredDocuments = [
  { type: DOCUMENT_TYPE.PAN, label: "PAN card" },
  { type: DOCUMENT_TYPE.AADHAAR, label: "Aadhaar" },
  { type: DOCUMENT_TYPE.SALARY_SLIP, label: "Salary slip (last 3 months)" },
  { type: DOCUMENT_TYPE.BANK_STATEMENT, label: "Bank statement (6 months)" },
];

const DocumentsPage: NextPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const applicationId = typeof router.query.applicationId === "string" ? router.query.applicationId : "";
  const [uploadingType, setUploadingType] = useState("");
  const [error, setError] = useState("");

  const applicationQuery = useQuery(
    ["application-documents", applicationId],
    async () => {
      const response = await bSdk.Applications_Get({ _id: applicationId });
      if (!response.status) {
        throw new Error(response.message || "Failed to load application.");
      }
      return response.data;
    },
    { enabled: !!applicationId }
  );

  const uploadedByType = useMemo(() => {
    const map: Record<string, any> = {};
    const docs = applicationQuery.data?.Documents || [];
    for (let i = 0; i < docs.length; i++) {
      map[docs[i].DocumentType] = docs[i];
    }
    return map;
  }, [applicationQuery.data]);

  return (
    <CustomerAuthGuard>
      <CustomerAppLayout>
        <PageContainer maxWidth="md">
          <Typography variant="h4" component="h1" fontWeight={800} gutterBottom>
            Upload documents
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Securely upload KYC and income documents for your application.
          </Typography>

          {!applicationId ? (
            <Typography color="error">Application ID is required.</Typography>
          ) : null}

          {applicationQuery.isLoading ? <Typography>Loading application...</Typography> : null}
          {applicationQuery.error ? <Typography color="error">{(applicationQuery.error as Error).message}</Typography> : null}

          <Stack spacing={2}>
            {requiredDocuments.map((doc) => {
              const uploaded = uploadedByType[doc.type];
              return (
                <Card key={doc.type}>
                  <CardContent>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {doc.label}
                        </Typography>
                        <Chip
                          size="small"
                          label={uploaded ? "Uploaded" : "Pending"}
                          color={uploaded ? "success" : "warning"}
                          sx={{ mt: 1 }}
                        />
                      </Box>
                      <Button
                        variant="outlined"
                        component="label"
                        startIcon={<CloudUploadOutlinedIcon />}
                        disabled={uploadingType === doc.type}
                      >
                        {uploadingType === doc.type ? "Uploading..." : "Upload"}
                        <input
                          hidden
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={async (event) => {
                            const file = event.target.files?.[0];
                            if (!file || !applicationId) {
                              return;
                            }
                            setUploadingType(doc.type);
                            setError("");
                            try {
                              const reader = new FileReader();
                              const base64 = await new Promise<string>((resolve, reject) => {
                                reader.onload = () => resolve(String(reader.result || ""));
                                reader.onerror = reject;
                                reader.readAsDataURL(file);
                              });

                              const response = await bSdk.Documents_Upload({
                                ApplicationID: applicationId,
                                DocumentType: doc.type,
                                Name: file.name,
                                FileBase64: base64,
                                ContentType: file.type,
                              });
                              if (!response.status) {
                                throw new Error(response.message || "Upload failed.");
                              }
                              queryClient.invalidateQueries(["application-documents", applicationId]);
                            } catch (ex: any) {
                              setError(ex.response?.data?.message || ex.message || "Upload failed.");
                            } finally {
                              setUploadingType("");
                              event.target.value = "";
                            }
                          }}
                        />
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>

          {error ? (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          ) : null}

          <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
            <Button
              variant="contained"
              color="secondary"
              disabled={!applicationId}
              onClick={async () => {
                if (!applicationId) {
                  return;
                }
                setError("");
                try {
                  const response = await bSdk.Applications_Save({
                    _id: applicationId,
                    ProductID: applicationQuery.data?.ProductID,
                    FormData: applicationQuery.data?.FormData || {},
                    Status: APPLICATION_STATUS.UNDER_REVIEW,
                  });
                  if (!response.status) {
                    throw new Error(response.message || "Failed to submit application.");
                  }
                  router.push(`/app/matching?applicationId=${applicationId}`);
                } catch (ex: any) {
                  setError(ex.response?.data?.message || ex.message || "Failed to submit application.");
                }
              }}
            >
              Submit for matching
            </Button>
            <Button component={NextLink} href="/app/dashboard" variant="outlined">
              Save & exit
            </Button>
          </Stack>
        </PageContainer>
      </CustomerAppLayout>
    </CustomerAuthGuard>
  );
};

export default DocumentsPage;
