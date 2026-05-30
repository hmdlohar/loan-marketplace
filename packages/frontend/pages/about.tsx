import Typography from "@mui/material/Typography";
import type { NextPage } from "next";
import { APP_NAME } from "commonlib";
import PageContainer from "../components/common/PageContainer";
import LandingLayout from "../layouts/landing/LandingLayout";

const AboutPage: NextPage = () => {
  return (
    <LandingLayout>
      <PageContainer maxWidth="md">
        <Typography variant="h2" gutterBottom>
          About {APP_NAME}
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          {APP_NAME} is a multi-sided loan marketplace connecting borrowers with banks and NBFCs through a single,
          transparent application journey.
        </Typography>
        <Typography variant="body1" color="text.secondary">
          We prioritize institutional trust, clear financial terms, and efficient matching — so you can compare offers
          with confidence before committing.
        </Typography>
      </PageContainer>
    </LandingLayout>
  );
};

export default AboutPage;
