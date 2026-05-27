import { Box, Container, Typography } from "@mui/material";
import type { NextPage } from "next";

const LoginPage: NextPage = () => {
  return (
    <Box sx={{ minHeight: "100vh", py: 6 }}>
      <Container maxWidth="sm">
        <Typography variant="h4" component="h1" gutterBottom>
          Sign in
        </Typography>
        <Typography color="text.secondary">
          Auth RPC and login form will be added when the user collection is ready.
        </Typography>
      </Container>
    </Box>
  );
};

export default LoginPage;
