import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { NextPage } from "next";
import NextLink from "next/link";
import PageContainer from "../../../components/common/PageContainer";
import AuthGuard from "../../../guards/AuthGuard";
import AppLayout from "../../../layouts/app/AppLayout";
import { formatINR, getMockProducts, updateMockApplication, type MockLoanProduct } from "../../../services/mock/applicationMock";
import { trustShadowSx } from "../../../theme/styleHelpers";

const ProductsPage: NextPage = () => {
  const products = getMockProducts();

  return (
    <AuthGuard>
      <AppLayout>
        <PageContainer>
          <Stack spacing={1} sx={{ mb: 4 }}>
            <Typography variant="h4" component="h1">
              Select your loan product
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Choose the product that fits your goal. You can change this before submitting your application.
            </Typography>
          </Stack>
          <Grid container spacing={2}>
            {products.map((product: MockLoanProduct) => (
              <Grid key={product.id} size={{ xs: 12, md: 6 }}>
                <Card
                  sx={(theme) => ({
                    height: "100%",
                    "&:hover": trustShadowSx(theme),
                  })}
                >
                  <CardActionArea
                    component={NextLink}
                    href="/app/apply"
                    onClick={() => {
                      updateMockApplication({ product: product.id });
                    }}
                    sx={{ height: "100%", alignItems: "stretch" }}
                  >
                    <CardContent>
                      <Stack spacing={2} sx={{ height: "100%" }}>
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            {product.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {product.description}
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          <Chip
                            size="small"
                            label={`From ${product.aprFrom}% APR`}
                            color="secondary"
                            variant="outlined"
                          />
                          {product.maxAmount > 0 ? (
                            <Chip
                              size="small"
                              label={`Up to ${formatINR(product.maxAmount)}`}
                              variant="outlined"
                            />
                          ) : null}
                        </Stack>
                        <Button endIcon={<ArrowForwardIcon />} sx={{ alignSelf: "flex-start", mt: "auto" }}>
                          Continue
                        </Button>
                      </Stack>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </PageContainer>
      </AppLayout>
    </AuthGuard>
  );
};

export default ProductsPage;
