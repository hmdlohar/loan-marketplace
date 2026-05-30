import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { APP_LOGO_BY_SIZE, APP_NAME, type AppLogoSize } from "commonlib";
import NextLink from "next/link";

const logoHeights: Record<AppLogoSize, number> = {
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
};

export default function AppLogo(props: {
  size?: AppLogoSize;
  showName?: boolean;
  href?: string;
  nameVariant?: "h6" | "body1";
}) {
  const size = props.size || "md";
  const showName = props.showName === true;
  const href = props.href;
  const nameVariant = props.nameVariant || "h6";

  const content = (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 1.25,
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <Box
        component="img"
        src={APP_LOGO_BY_SIZE[size]}
        alt={`${APP_NAME} logo`}
        sx={{
          height: logoHeights[size],
          width: "auto",
          display: "block",
          flexShrink: 0,
        }}
      />
      {showName ? (
        <Typography
          variant={nameVariant}
          sx={{
            fontWeight: 700,
            color: "primary.main",
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
          }}
        >
          {APP_NAME}
        </Typography>
      ) : null}
    </Box>
  );

  if (href) {
    return (
      <Box component={NextLink} href={href} sx={{ textDecoration: "none", color: "inherit" }}>
        {content}
      </Box>
    );
  }

  return content;
}
