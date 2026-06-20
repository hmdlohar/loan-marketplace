import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Form, Formik } from "formik";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "react-query";
import {
  APPLICATION_STATUS,
  FormFieldDefinition,
  getFormDataValidationErrors,
  getStaticFormFields,
  LOAN_PRODUCT,
} from "commonlib";
import PageContainer from "../../../components/common/PageContainer";
import DynamicFormFields from "../../../components/customer/DynamicFormFields";
import ApplyFormAutoSave from "../../../components/customer/ApplyFormAutoSave";
import CustomerAppLayout from "../../../layouts/app/CustomerAppLayout";
import AuthGuard from "../../../guards/AuthGuard";
import { bSdk } from "../../../services/BackendSDKService";
import AuthServices from "../../../services/AuthServices";
import { buildMergedFormValues, loanProductLabels } from "../../../services/customerUtil";

const ApplyFormPage: NextPage = () => (
  <AuthGuard login="otp">
    <ApplyFormPageContent />
  </AuthGuard>
);

function ApplyFormPageContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const applicationId = typeof router.query.applicationId === "string" ? router.query.applicationId : "";
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
  }, { refetchOnMount: "always" });

  const authMobile = AuthServices.getUserData()?.Mobile || "";
  const loanType = (applicationQuery.data?.LoanType || "") as LOAN_PRODUCT;
  const fields = useMemo(() => {
    if (!loanType) {
      return [] as FormFieldDefinition[];
    }
    return getStaticFormFields(loanType);
  }, [loanType]);

  const formReady = !applicationQuery.isLoading && !profileQuery.isLoading && !!loanType && fields.length > 0;

  const mergedValues = useMemo(() => {
    if (!fields.length) {
      return {} as Record<string, string>;
    }
    return buildMergedFormValues(fields, profileQuery.data || null, applicationQuery.data?.FormData, authMobile);
  }, [fields, profileQuery.data, applicationQuery.data, authMobile]);

  const [formInitialValues, setFormInitialValues] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    setFormInitialValues(null);
  }, [applicationId]);

  useEffect(() => {
    if (formReady && !formInitialValues) {
      setFormInitialValues(mergedValues);
    }
  }, [formReady, formInitialValues, mergedValues]);

  const hideFieldKeys = authMobile ? ["mobile"] : [];

  return (
    <CustomerAppLayout>
      <PageContainer maxWidth="md">
        {applicationQuery.isLoading ? <Typography>Loading application form...</Typography> : null}
        {applicationQuery.error ? <Typography color="error">{(applicationQuery.error as Error).message}</Typography> : null}

        {loanType && formReady && formInitialValues ? (
          <Formik
            enableReinitialize={false}
            initialValues={formInitialValues}
            validate={async (values) => {
              const payload = { ...values };
              if (authMobile && payload.mobile !== undefined && !payload.mobile) {
                payload.mobile = authMobile;
              }
              return getFormDataValidationErrors(fields, payload);
            }}
            onSubmit={async (values, helpers) => {
              if (!applicationId) {
                return;
              }
              setError("");
              const payload = { ...values };
              if (authMobile && payload.mobile !== undefined && !payload.mobile) {
                payload.mobile = authMobile;
              }
              try {
                const response = await bSdk.Applications_Save({
                  _id: applicationId,
                  LoanType: loanType,
                  FormData: payload,
                  Status: APPLICATION_STATUS.UNDER_REVIEW,
                });
                if (!response.status) {
                  throw new Error(response.message || "Failed to save application.");
                }
                await queryClient.invalidateQueries(["customer-profile"]);
                await queryClient.invalidateQueries(["application-form", applicationId]);
                router.push(`/app/apply/recommendations?applicationId=${applicationId}`);
              } catch (ex: any) {
                setError(ex.response?.data?.message || ex.message || "Failed to save application.");
              } finally {
                helpers.setSubmitting(false);
              }
            }}
          >
            {(formik) => (
              <Form>
                <ApplyFormAutoSave
                  applicationId={applicationId}
                  loanType={loanType}
                  applicationStatus={applicationQuery.data?.Status}
                  authMobile={authMobile}
                />
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
                    values={formik.values}
                    errors={formik.errors}
                    touched={formik.touched}
                    submitCount={formik.submitCount}
                    hideFieldKeys={hideFieldKeys}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />

                  {error ? <Typography color="error">{error}</Typography> : null}

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="secondary"
                      size="large"
                      endIcon={<ArrowForwardIcon />}
                      disabled={formik.isSubmitting || !applicationId}
                    >
                      {formik.isSubmitting ? "Saving..." : "Find my best products"}
                    </Button>
                    <Button
                      type="button"
                      variant="outlined"
                      onClick={() => router.push(`/app/apply/documents?applicationId=${applicationId}`)}
                    >
                      Back
                    </Button>
                  </Stack>
                </Stack>
              </Form>
            )}
          </Formik>
        ) : null}
      </PageContainer>
    </CustomerAppLayout>
  );
}

export default ApplyFormPage;
