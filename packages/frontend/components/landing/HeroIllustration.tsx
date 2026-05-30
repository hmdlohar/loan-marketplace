import Box from "@mui/material/Box";
import { keyframes } from "@mui/material/styles";

const heroFloatDesktop = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-16px); }
`;

const heroFloatMobile = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

const heroGlowPulse = keyframes`
  0% { opacity: 0.45; transform: translate(-50%, -50%) scale(0.95); }
  70% { opacity: 0.15; transform: translate(-50%, -50%) scale(1.08); }
  100% { opacity: 0.45; transform: translate(-50%, -50%) scale(0.95); }
`;

export const HERO_ILLUSTRATION_SRC = "/illustrations/hero-ecosystem.png";

export default function HeroIllustration() {
  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        mx: "auto",
        maxWidth: { xs: 420, md: 520 },
        "@media (prefers-reduced-motion: reduce)": {
          "& .hero-float": { animation: "none" },
          "& .hero-glow": { animation: "none" },
        },
      }}
    >
      <Box
        className="hero-glow"
        aria-hidden
        sx={{
          display: { xs: "none", md: "block" },
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "78%",
          height: "78%",
          borderRadius: "50%",
          bgcolor: "rgba(107, 254, 156, 0.22)",
          filter: "blur(48px)",
          zIndex: 0,
          animation: `${heroGlowPulse} 4s ease-in-out infinite`,
        }}
      />

      <Box
        className="hero-float"
        sx={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          isolation: "isolate",
          px: { xs: 0, md: 0 },
          py: { xs: 0, md: 0 },
          borderRadius: 0,
          bgcolor: "transparent",
          boxShadow: "none",
        }}
      >
        <Box
          component="img"
          src={HERO_ILLUSTRATION_SRC}
          alt="Financial marketplace ecosystem illustration"
          sx={(theme) => ({
            display: "block",
            width: "100%",
            height: "auto",
            borderRadius: 1,
            animation: {
              xs: `${heroFloatMobile} 4.5s ease-in-out infinite`,
              md: `${heroFloatDesktop} 6s ease-in-out infinite`,
            },
            ...theme.applyStyles("dark", {
              mixBlendMode: "multiply",
              filter: "saturate(1.12) brightness(1.1) contrast(1.05)",
            }),
          })}
        />
      </Box>
    </Box>
  );
}
