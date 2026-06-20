import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { NextPage } from "next";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "react-query";
import { APPLICATION_STATUS, DOCUMENT_TYPE, getRequiredDocuments, LOAN_PRODUCT, validatePanAadhaarNameMatch } from "commonlib";
import PageContainer from "../../../components/common/PageContainer";
import SavedDocumentPicker from "../../../components/customer/SavedDocumentPicker";
import CustomerAppLayout from "../../../layouts/app/CustomerAppLayout";
import AuthGuard from "../../../guards/AuthGuard";
import { bSdk } from "../../../services/BackendSDKService";
import { loanProductLabels } from "../../../services/customerUtil";

function replaceApplicationDocument(current: any, document: any) {
  if (!current) {
    return current;
  }

  const documents = current.Documents || [];
  const nextDocuments = [];
  let replaced = false;
  for (let i = 0; i < documents.length; i++) {
    if (documents[i].DocumentType === document.DocumentType) {
      nextDocuments.push(document);
      replaced = true;
    } else {
      nextDocuments.push(documents[i]);
    }
  }
  if (!replaced) {
    nextDocuments.push(document);
  }

  return {
    ...current,
    Documents: nextDocuments,
  };
}

const DocumentsPage: NextPage = () => (
  <AuthGuard login="otp">
    <DocumentsPageContent />
  </AuthGuard>
);

function DocumentsPageContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const applicationId = typeof router.query.applicationId === "string" ? router.query.applicationId : "";
  const [uploadingType, setUploadingType] = useState("");
  const [loading, setLoading] = useState(false);
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

  const vaultQuery = useQuery(["customer-vault-docs"], async () => {
    const response = await bSdk.Documents_ListVault({});
    if (!response.status) {
      throw new Error(response.message || "Failed to load saved documents.");
    }
    return response.data;
  });

  const loanType = (applicationQuery.data?.LoanType || "") as LOAN_PRODUCT;
  const requiredDocuments = useMemo(() => {
    if (!loanType) {
      return [];
    }
    return getRequiredDocuments(loanType);
  }, [loanType]);

  const uploadedByType = useMemo(() => {
    const map: Record<string, any> = {};
    const docs = applicationQuery.data?.Documents || [];
    for (let i = 0; i < docs.length; i++) {
      map[docs[i].DocumentType] = docs[i];
    }
    return map;
  }, [applicationQuery.data]);

  const vaultByType: Record<string, any[]> = vaultQuery.data?.items || {};

  const readFileBase64 = (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleUpload = async (docType: DOCUMENT_TYPE, file: File) => {
    if (!applicationId) {
      return;
    }
    setUploadingType(docType);
    setError("");
    try {
      const base64 = await readFileBase64(file);
      const response = await bSdk.Documents_Upload({
        ApplicationID: applicationId,
        DocumentType: docType,
        Name: file.name,
        FileBase64: base64,
        ContentType: file.type,
      });
      if (!response.status) {
        throw new Error(response.message || "Upload failed.");
      }
      queryClient.setQueryData(["application-documents", applicationId], (current: any) =>
        replaceApplicationDocument(current, response.data)
      );
      await queryClient.refetchQueries(["application-documents", applicationId]);
      await queryClient.invalidateQueries(["customer-vault-docs"]);
    } catch (ex: any) {
      setError(ex.response?.data?.message || ex.message || "Upload failed.");
    } finally {
      setUploadingType("");
    }
  };

  const handleUseSaved = async (docType: DOCUMENT_TYPE, documentId: string) => {
    if (!documentId || !applicationId) {
      return;
    }
    setUploadingType(docType);
    setError("");
    try {
      const response = await bSdk.Documents_AttachToApplication({
        ApplicationID: applicationId,
        DocumentID: documentId,
      });
      if (!response.status) {
        throw new Error(response.message || "Failed to attach saved document.");
      }
      queryClient.setQueryData(["application-documents", applicationId], (current: any) =>
        replaceApplicationDocument(current, response.data)
      );
      await queryClient.refetchQueries(["application-documents", applicationId]);
    } catch (ex: any) {
      setError(ex.response?.data?.message || ex.message || "Failed to attach saved document.");
    } finally {
      setUploadingType("");
    }
  };

  const allDocsAttached = requiredDocuments.every((doc) => !!uploadedByType[doc.type]);

  return (
    <CustomerAppLayout>
        <PageContainer maxWidth="md">
          <Typography variant="h4" component="h1" fontWeight={800} gutterBottom>
            Upload documents
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            {loanType
              ? `Required documents for your ${loanProductLabels[loanType] || "loan"} application. Reuse saved documents when available.`
              : "Securely upload KYC and income documents for your application."}
          </Typography>

          {!applicationId ? <Typography color="error">Application ID is required.</Typography> : null}
          {applicationQuery.isLoading ? <Typography>Loading application...</Typography> : null}
          {applicationQuery.error ? <Typography color="error">{(applicationQuery.error as Error).message}</Typography> : null}

          <Stack spacing={2}>
            {requiredDocuments.map((doc) => (
              <SavedDocumentPicker
                key={doc.type}
                documentType={doc.type}
                label={doc.label}
                savedDocs={vaultByType[doc.type] || []}
                attachedDoc={uploadedByType[doc.type] || null}
                uploading={uploadingType === doc.type}
                onUseSaved={(documentId) => handleUseSaved(doc.type, documentId)}
                onUpload={(file) => handleUpload(doc.type, file)}
              />
            ))}
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
              endIcon={<ArrowForwardIcon />}
              disabled={!applicationId || !allDocsAttached || loading}
              onClick={async () => {
                if (!applicationId) {
                  return;
                }
                setLoading(true);
                setError("");
                try {
                  const panDoc = uploadedByType[DOCUMENT_TYPE.PAN];
                  const aadhaarDoc = uploadedByType[DOCUMENT_TYPE.AADHAAR];
                  let panParsedDoc = panDoc;
                  let aadhaarParsedDoc = aadhaarDoc;
                  const requiresPan = requiredDocuments.some((doc) => doc.type === DOCUMENT_TYPE.PAN);
                  const requiresAadhaar = requiredDocuments.some((doc) => doc.type === DOCUMENT_TYPE.AADHAAR);

                  if (panDoc?._id) {
                    const panResponse = await bSdk.Documents_Parse({ DocumentID: panDoc._id });
                    if (!panResponse.status) {
                      throw new Error(panResponse.message || "Failed to parse PAN card.");
                    }
                    panParsedDoc = panResponse.data;
                  }
                  if (aadhaarDoc?._id) {
                    const aadhaarResponse = await bSdk.Documents_Parse({ DocumentID: aadhaarDoc._id });
                    if (!aadhaarResponse.status) {
                      throw new Error(aadhaarResponse.message || "Failed to parse Aadhaar card.");
                    }
                    aadhaarParsedDoc = aadhaarResponse.data;
                  }

                  if (requiresPan && requiresAadhaar && panParsedDoc && aadhaarParsedDoc) {
                    const nameMismatchError = validatePanAadhaarNameMatch(
                      panParsedDoc.ParsedData,
                      aadhaarParsedDoc.ParsedData
                    );
                    if (nameMismatchError) {
                      throw new Error(nameMismatchError);
                    }
                  }

                  const response = await bSdk.Applications_Save({
                    _id: applicationId,
                    LoanType: loanType,
                    FormData: applicationQuery.data?.FormData || {},
                    Status: APPLICATION_STATUS.PENDING_FORM,
                  });
                  if (!response.status) {
                    throw new Error(response.message || "Failed to continue application.");
                  }
                  router.push(`/app/apply/form?applicationId=${applicationId}`);
                } catch (ex: any) {
                  setError(ex.response?.data?.message || ex.message || "Failed to continue application.");
                } finally {
                  setLoading(false);
                }
              }}
            >
              {loading ? "Processing..." : "Continue to application form"}
            </Button>
            <Button component={NextLink} href="/app/dashboard" variant="outlined">
              Save & exit
            </Button>
          </Stack>
        </PageContainer>
    </CustomerAppLayout>
  );
}

export default DocumentsPage;
