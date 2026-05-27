import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import type { NextPage } from "next";
import PageContainer from "../components/common/PageContainer";
import LandingLayout from "../layouts/landing/LandingLayout";

const ContactPage: NextPage = () => {
  return (
    <LandingLayout>
      <PageContainer maxWidth="sm">
        <Typography variant="h2" gutterBottom>
          Contact us
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Questions about eligibility or partnerships? Send a message and our team will respond within one business day.
        </Typography>
        <Stack spacing={2} component="form">
          <TextField label="Full name" fullWidth />
          <TextField label="Email" type="email" fullWidth />
          <TextField label="Message" multiline rows={4} fullWidth />
          <Button variant="contained" color="primary" size="large">
            Send message
          </Button>
        </Stack>
      </PageContainer>
    </LandingLayout>
  );
};

export default ContactPage;
