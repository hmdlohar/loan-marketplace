import Box from "@mui/material/Box";
import LandingHeader, { LandingFooter } from "./LandingHeader";

export default function LandingLayout(props: { children: React.ReactNode }) {
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", bgcolor: "background.default" }}>
      <LandingHeader />
      <Box component="main" sx={{ flex: 1 }}>
        {props.children}
      </Box>
      <LandingFooter />
    </Box>
  );
}
