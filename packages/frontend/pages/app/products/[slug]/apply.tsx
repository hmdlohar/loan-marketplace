import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "react-query";
import { APPLICATION_STATUS, FormFieldDefinition } from "commonlib";
import PageContainer from "../../../../components/common/PageContainer";
import DynamicFormFields from "../../../../components/customer/DynamicFormFields";
import CustomerAppLayout from "../../../../layouts/app/CustomerAppLayout";
import CustomerAuthGuard from "../../../../guards/CustomerAuthGuard";
import { bSdk } from "../../../../services/BackendSDKService";
import { buildInitialFormValues } from "../../../../services/customerUtil";

const ApplyProductPage: NextPage = () => {
  const router = useRouter();
  const slug = typeof router.query.slug === "string" ? router.query.slug : "";
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const productQuery = useQuery(
    ["public-product-apply", slug],
    async () => {
      const response = await bSdk.Products_GetPublic({ slug });
      if (!response.status) {
        throw new Error(response.message || "Product not found.");
      }
      return response.data;
    },
    { enabled: !!slug }
  );

  const profileQuery = useQuery(["customer-profile"], async () => {
    const response = await bSdk.Customers_Get({});
    if (!response.status) {
      throw new Error(response.message || "Failed to load profile.");
    }
    return response.data;
  });

  const fields = useMemo(() => {
    return (productQuery.data?.FullFormFields || []) as FormFieldDefinition[];
  }, [productQuery.data]);

  useEffect(() => {
    if (!fields.length || !profileQuery.data) {
      return;
    }
    setValues(buildInitialFormValues(fields, profileQuery.data));
  }, [fields, profileQuery.data]);

  const product = productQuery.data;

  return (
    <CustomerAuthGuard>
      <CustomerAppLayout>
        <PageContainer maxWidth="md">
          {productQuery.isLoading ? <Typography>Loading application form...</Typography> : null}
          {productQuery.error ? <Typography color="error">{(productQuery.error as Error).message}</Typography> : null}

          {product ? (
            <Stack spacing={4}>
              <Box>
                <Typography variant="overline" color="text.secondary">
                  {product.Bank?.Name}
                </Typography>
                <Typography variant="h4" fontWeight={800} gutterBottom>
                  Apply for {product.Title}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Fill in your details below. Saved profile information is pre-filled where available.
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

              {error ? (
                <Typography color="error">{error}</Typography>
              ) : null}

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  disabled={loading}
                  onClick={async () => {
                    setLoading(true);
                    setError("");
                    try {
                      const response = await bSdk.Applications_Save({
                        ProductID: product._id,
                        FormData: values,
                        Status: APPLICATION_STATUS.PENDING_DOCUMENTS,
                      });
                      if (!response.status || !response.data?._id) {
                        throw new Error(response.message || "Failed to save application.");
                      }
                      router.push(`/app/apply/documents?applicationId=${response.data._id}`);
                    } catch (ex: any) {
                      setError(ex.response?.data?.message || ex.message || "Failed to save application.");
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  {loading ? "Saving..." : "Continue to documents"}
                </Button>
                <Button variant="outlined" onClick={() => router.push(`/app/products/${slug}`)}>
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

export default ApplyProductPage;
