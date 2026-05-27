import { Box, Container, Typography } from "@mui/material";
import type { NextPage } from "next";

const ApplyPage: NextPage = () => {
  return (
    <Box sx={{ minHeight: "100vh", py: 6 }}>
      <Container maxWidth="sm">
        <Typography variant="h4" component="h1" gutterBottom>
          Apply for a loan
        </Typography>
        <Typography color="text.secondary">
          Application flow will be built here. Backend RPC endpoints will be wired via{" "}
          <code>bSdk</code> from <code>services/BackendSDKService</code>.
        </Typography>
      </Container>
    </Box>
  );
};

export default ApplyPage;
