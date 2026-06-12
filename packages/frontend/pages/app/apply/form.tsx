import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "react-query";
import { APPLICATION_STATUS, FormFieldDefinition, getStaticFormFields, LOAN_PRODUCT } from "commonlib";
import PageContainer from "../../../components/common/PageContainer";
import DynamicFormFields from "../../../components/customer/DynamicFormFields";
import CustomerAppLayout from "../../../layouts/app/CustomerAppLayout";
import CustomerAuthGuard from "../../../guards/CustomerAuthGuard";
import { bSdk } from "../../../services/BackendSDKService";
import { buildInitialFormValues, loanProductLabels } from "../../../services/customerUtil";

const ApplyFormPage: NextPage = () => {
  const router = useRouter();
  const applicationId = typeof router.query.applicationId === "string" ? router.query.applicationId : "";
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const applicationQuery = useQuery(
    ["application-form", applicationId],
    async () => {
      const response = await bSdk.Applications_Get({ _id: applicationId });
      if (!response.status) {
        throw new Error(response.message || "Failed to load application.");
      }
      return response.data;
    },
    { enabled: !!applicationId }
  );

  const profileQuery = useQuery(["customer-profile"], async () => {
    const response = await bSdk.Customers_Get({});
    if (!response.status) {
      throw new Error(response.message || "Failed to load profile.");
    }
    return response.data;
  });

  const loanType = (applicationQuery.data?.LoanType || "") as LOAN_PRODUCT;
  const fields = useMemo(() => {
    if (!loanType) {
      return [] as FormFieldDefinition[];
    }
    return getStaticFormFields(loanType);
  }, [loanType]);

  useEffect(() => {
    if (!fields.length) {
      return;
    }
    const existingFormData = applicationQuery.data?.FormData || {};
    const profileValues = buildInitialFormValues(fields, profileQuery.data || null);
    const merged: Record<string, string> = { ...profileValues };
    const keys = Object.keys(existingFormData);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (existingFormData[key] !== undefined && existingFormData[key] !== null && existingFormData[key] !== "") {
        merged[key] = String(existingFormData[key]);
      }
    }
    setValues(merged);
  }, [fields, profileQuery.data, applicationQuery.data]);

  return (
    <CustomerAuthGuard>
      <CustomerAppLayout>
        <PageContainer maxWidth="md">
          {applicationQuery.isLoading ? <Typography>Loading application form...</Typography> : null}
          {applicationQuery.error ? <Typography color="error">{(applicationQuery.error as Error).message}</Typography> : null}

          {loanType ? (
            <Stack spacing={4}>
              <Box>
                <Typography variant="overline" color="text.secondary">
                  {loanProductLabels[loanType]}
                </Typography>
                <Typography variant="h4" fontWeight={800} gutterBottom>
                  Complete your application
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  We pre-filled details from your documents and saved profile. Review and complete any remaining
                  fields.
                </Typography>
              </Box>

              <DynamicFormFields
                fields={fields}
                values={values}
                onChange={(key, value) => {
                  setValues((current) => ({
                    ...current,
                    [key]: value,
                  }));
                }}
              />

              {error ? <Typography color="error">{error}</Typography> : null}

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  disabled={loading || !applicationId}
                  onClick={async () => {
                    if (!applicationId) {
                      return;
                    }
                    setLoading(true);
                    setError("");
                    try {
                      const response = await bSdk.Applications_Save({
                        _id: applicationId,
                        LoanType: loanType,
                        FormData: values,
                        Status: APPLICATION_STATUS.UNDER_REVIEW,
                      });
                      if (!response.status) {
                        throw new Error(response.message || "Failed to save application.");
                      }
                      router.push(`/app/apply/recommendations?applicationId=${applicationId}`);
                    } catch (ex: any) {
                      setError(ex.response?.data?.message || ex.message || "Failed to save application.");
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  {loading ? "Saving..." : "Find my best products"}
                </Button>
                <Button variant="outlined" onClick={() => router.push(`/app/apply/documents?applicationId=${applicationId}`)}>
                  Back
                </Button>
              </Stack>
            </Stack>
          ) : null}
        </PageContainer>
      </CustomerAppLayout>
    </CustomerAuthGuard>
  );
};

export default ApplyFormPage;
