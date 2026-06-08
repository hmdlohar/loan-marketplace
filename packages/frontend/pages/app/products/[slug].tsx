import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import { useQuery } from "react-query";
import PageContainer from "../../../components/common/PageContainer";
import OtpLoginModal from "../../../components/customer/OtpLoginModal";
import CustomerAppLayout from "../../../layouts/app/CustomerAppLayout";
import AuthServices from "../../../services/AuthServices";
import { bSdk } from "../../../services/BackendSDKService";
import { getFileProxyUrl } from "../../../services/fileProxyUtil";
import { loanProductLabels } from "../../../services/customerUtil";

const ProductDetailPage: NextPage = () => {
  const router = useRouter();
  const slug = typeof router.query.slug === "string" ? router.query.slug : "";
  const [otpOpen, setOtpOpen] = useState(false);

  const productQuery = useQuery(
    ["public-product", slug],
    async () => {
      const response = await bSdk.Products_GetPublic({ slug });
      if (!response.status) {
        throw new Error(response.message || "Product not found.");
      }
      return response.data;
    },
    { enabled: !!slug }
  );

  const product = productQuery.data;
  const bankName = product?.Bank?.Name || "Partner bank";
  const logoUrl = product?.Bank?.LogoPath ? getFileProxyUrl(product.Bank.LogoPath) : "";

  const handleApply = () => {
    if (!AuthServices.isAuthenticated()) {
      setOtpOpen(true);
      return;
    }
    router.push(`/app/products/${slug}/apply`);
  };

  return (
    <CustomerAppLayout>
      <PageContainer maxWidth="lg">
        {productQuery.isLoading ? <Typography>Loading product...</Typography> : null}
        {productQuery.error ? <Typography color="error">{(productQuery.error as Error).message}</Typography> : null}

        {product ? (
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 7 }}>
              <Stack spacing={3}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar src={logoUrl} alt={bankName} variant="rounded" sx={{ width: 64, height: 64 }}>
                    {bankName.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="overline" color="text.secondary">
                      {bankName}
                    </Typography>
                    <Typography variant="h3" sx={{ fontSize: { xs: "1.75rem", md: "2.5rem" }, fontWeight: 800 }}>
                      {product.Title}
                    </Typography>
                  </Box>
                </Stack>

                <Chip label={loanProductLabels[product.LoanType] || product.LoanType} color="secondary" sx={{ alignSelf: "flex-start" }} />

                <Typography variant="h6" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  {product.ShortDescription}
                </Typography>

                {(product.KeyBenefits || []).length ? (
                  <Stack spacing={1.5}>
                    <Typography variant="h6" fontWeight={700}>
                      Key benefits
                    </Typography>
                    {(product.KeyBenefits || []).map((benefit: string) => (
                      <Stack key={benefit} direction="row" spacing={1.5} alignItems="flex-start">
                        <CheckCircleOutlineIcon color="secondary" sx={{ mt: 0.2, fontSize: 20 }} />
                        <Typography variant="body1">{benefit}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                ) : null}
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <Box
                sx={{
                  position: { md: "sticky" },
                  top: 96,
                  p: 3,
                  borderRadius: 4,
                  border: 1,
                  borderColor: "divider",
                  bgcolor: "background.paper",
                  boxShadow: (theme) => theme.shadows[2],
                }}
              >
                <Stack spacing={2.5}>
                  <Typography variant="h5" fontWeight={700}>
                    Ready to apply?
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Complete a guided eligibility form in minutes. We will save your details for future applications.
                  </Typography>
                  <Button variant="contained" color="secondary" size="large" endIcon={<ArrowForwardIcon />} onClick={handleApply}>
                    Apply now
                  </Button>
                  <Typography variant="caption" color="text.secondary">
                    OTP verification required. Browse freely — sign in only when you apply.
                  </Typography>
                </Stack>
              </Box>
            </Grid>
          </Grid>
        ) : null}
      </PageContainer>

      <OtpLoginModal
        open={otpOpen}
        onClose={() => setOtpOpen(false)}
        onSuccess={() => {
          setOtpOpen(false);
          router.push(`/app/products/${slug}/apply`);
        }}
      />
    </CustomerAppLayout>
  );
};

export default ProductDetailPage;
