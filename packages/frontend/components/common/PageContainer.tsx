import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { lendingCoreTokens } from "../../theme/tokens";

export default function PageContainer(props: { children: React.ReactNode; maxWidth?: "sm" | "md" | "lg" | "xl" }) {
  const maxWidth = props.maxWidth || "lg";

  return (
    <Box
      sx={{
        py: { xs: 3, md: 5 },
        px: {
          xs: `${lendingCoreTokens.layout.marginMobile}px`,
          md: `${lendingCoreTokens.layout.marginDesktop}px`,
        },
      }}
    >
      <Container maxWidth={maxWidth} disableGutters>
        {props.children}
      </Container>
    </Box>
  );
}
