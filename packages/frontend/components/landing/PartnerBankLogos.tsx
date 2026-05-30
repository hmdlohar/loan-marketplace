import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { partnerBanks } from "../../config/partnerBanks";
import PageContainer from "../common/PageContainer";
import { lendingCoreTokens } from "../../theme/tokens";

const light = lendingCoreTokens.colors.light;
const dark = lendingCoreTokens.colors.dark;

export default function PartnerBankLogos() {
  return (
    <Box
      component="section"
      aria-label="Partner banks"
      sx={(theme) => ({
        py: { xs: 2.5, md: 3 },
        borderTop: 1,
        borderColor: "divider",
        ...theme.applyStyles("dark", {
          borderColor: "rgba(182, 198, 240, 0.12)",
        }),
      })}
    >
      <PageContainer py={0} pt={0} pb={0}>
        <Typography
          variant="overline"
          sx={(theme) => ({
            display: "block",
            mb: { xs: 1.5, md: 2 },
            letterSpacing: "0.08em",
            fontWeight: 600,
            color: light.onSurfaceVariant,
            ...theme.applyStyles("dark", { color: dark.onSurfaceVariant }),
          })}
        >
          Trusted partner lenders
        </Typography>

        <Box
          sx={{
            overflowX: "auto",
            overflowY: "hidden",
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={{ xs: 3.5, md: 5 }}
            sx={{
              flexWrap: "nowrap",
              width: "max-content",
              minWidth: "100%",
              py: 0.5,
            }}
          >
            {partnerBanks.map((bank) => (
              <Box
                key={bank.id}
                component="img"
                src={bank.logo}
                alt={`${bank.name} logo`}
                loading="lazy"
                draggable={false}
                sx={(theme) => ({
                  height: { xs: 26, md: 30 },
                  width: "auto",
                  maxWidth: { xs: 96, md: 120 },
                  objectFit: "contain",
                  flexShrink: 0,
                  opacity: 0.68,
                  filter: "grayscale(100%)",
                  transition: "opacity 0.2s ease, filter 0.2s ease",
                  "&:hover": {
                    opacity: 0.92,
                    filter: "grayscale(0%)",
                  },
                  ...theme.applyStyles("dark", {
                    opacity: 0.78,
                    filter: "grayscale(35%) brightness(1.12)",
                    "&:hover": {
                      opacity: 1,
                      filter: "grayscale(0%) brightness(1.05)",
                    },
                  }),
                })}
              />
            ))}
          </Stack>
        </Box>
      </PageContainer>
    </Box>
  );
}
