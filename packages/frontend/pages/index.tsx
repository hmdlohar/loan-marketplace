import { Box, Button, Container, Stack, Typography } from "@mui/material";
import type { NextPage } from "next";
import Link from "next/link";

const Home: NextPage = () => {
  return (
    <Box sx={{ minHeight: "100vh", py: 8 }}>
      <Container maxWidth="md">
        <Stack spacing={3}>
          <Typography variant="h3" component="h1" fontWeight={700}>
            Loan Marketplace
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Compare loan offers from banks and NBFCs. Apply once, get matched to the right product.
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button component={Link} href="/apply" variant="contained" size="large">
              Check eligibility
            </Button>
            <Button component={Link} href="/login" variant="outlined" size="large">
              Sign in
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};

export default Home;
