import type { NextPage } from "next";
import HomePageContent from "../components/landing/HomePageContent";
import LandingLayout from "../layouts/landing/LandingLayout";

const Home: NextPage = () => {
  return (
    <LandingLayout>
      <HomePageContent />
    </LandingLayout>
  );
};

export default Home;
