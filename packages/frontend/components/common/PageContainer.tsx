import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { lendingCoreTokens } from "../../theme/tokens";

export default function PageContainer(props: {
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
  py?: { xs?: number; md?: number } | number;
  pt?: { xs?: number; md?: number } | number;
  pb?: { xs?: number; md?: number } | number;
}) {
  const maxWidth = props.maxWidth || "lg";
  const defaultPy = { xs: 3, md: 5 };

  return (
    <Box
      sx={{
        px: {
          xs: `${lendingCoreTokens.layout.marginMobile}px`,
          md: `${lendingCoreTokens.layout.marginDesktop}px`,
        },
        ...(props.py !== undefined ? { py: props.py } : null),
        ...(props.pt !== undefined ? { pt: props.pt } : null),
        ...(props.pb !== undefined ? { pb: props.pb } : null),
        ...(props.py === undefined && props.pt === undefined && props.pb === undefined ? { py: defaultPy } : null),
      }}
    >
      <Container maxWidth={maxWidth} disableGutters>
        {props.children}
      </Container>
    </Box>
  );
}
