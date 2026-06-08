import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useQuery } from "react-query";
import { LOAN_PRODUCT } from "commonlib";
import PageContainer from "../../../components/common/PageContainer";
import ProductCard from "../../../components/customer/ProductCard";
import CustomerAppLayout from "../../../layouts/app/CustomerAppLayout";
import { bSdk } from "../../../services/BackendSDKService";
import {
  loanProductDescriptions,
  loanProductLabels,
  loanProductOrder,
} from "../../../services/customerUtil";
import { trustShadowSx } from "../../../theme/styleHelpers";

const ProductsPage: NextPage = () => {
  const router = useRouter();
  const selectedType = typeof router.query.type === "string" ? router.query.type : "";

  const productsQuery = useQuery(
    ["public-products", selectedType],
    async () => {
      const response = await bSdk.Products_ListPublic({
        page: 1,
        pageSize: 100,
        loanType: selectedType ? (selectedType as LOAN_PRODUCT) : undefined,
      });
      if (!response.status) {
        throw new Error(response.message || "Failed to load products.");
      }
      return response.data;
    },
    { keepPreviousData: true }
  );

  return (
    <CustomerAppLayout>
      <PageContainer maxWidth="lg">
        <Stack spacing={4}>
          <Stack spacing={1}>
            <Typography variant="h3" component="h1" sx={{ fontSize: { xs: "2rem", md: "2.75rem" }, fontWeight: 800 }}>
              Find the right loan for you
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 720 }}>
              Browse curated offers from banks and NBFCs. No login needed to explore — verify with OTP only when you apply.
            </Typography>
          </Stack>

          <Grid container spacing={2}>
            {loanProductOrder.map((loanType) => {
              const active = selectedType === loanType;
              return (
                <Grid key={loanType} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Card
                    sx={(theme) => ({
                      height: "100%",
                      borderColor: active ? "secondary.main" : "divider",
                      ...(active ? trustShadowSx(theme) : {}),
                    })}
                  >
                    <CardActionArea
                      onClick={() => {
                        router.push({
                          pathname: "/app/products",
                          query: { type: loanType },
                        });
                      }}
                      sx={{ height: "100%" }}
                    >
                      <CardContent>
                        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                          {loanProductLabels[loanType]}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {loanProductDescriptions[loanType]}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {selectedType ? (
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                <Typography variant="h5" fontWeight={700}>
                  {loanProductLabels[selectedType]} offers
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {productsQuery.data?.total || 0} products
                </Typography>
              </Stack>

              {productsQuery.isLoading ? (
                <Typography color="text.secondary">Loading products...</Typography>
              ) : null}

              {productsQuery.error ? (
                <Typography color="error">{(productsQuery.error as Error).message}</Typography>
              ) : null}

              <Grid container spacing={2}>
                {(productsQuery.data?.items || []).map((product: any) => (
                  <Grid key={product._id} size={{ xs: 12, md: 6, lg: 4 }}>
                    <ProductCard product={product} />
                  </Grid>
                ))}
              </Grid>

              {!productsQuery.isLoading && !(productsQuery.data?.items || []).length ? (
                <Box sx={{ py: 6, textAlign: "center" }}>
                  <Typography color="text.secondary">No products available in this category yet.</Typography>
                </Box>
              ) : null}
            </Stack>
          ) : (
            <Box sx={{ py: 4, textAlign: "center" }}>
              <Typography variant="h6" color="text.secondary">
                Select a loan type above to browse available products
              </Typography>
            </Box>
          )}
        </Stack>
      </PageContainer>
    </CustomerAppLayout>
  );
};

export default ProductsPage;
