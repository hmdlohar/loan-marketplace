import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import PageContainer from "../common/PageContainer";
import { getFileProxyUrl } from "../../services/fileProxyUtil";
import { CatalogBank } from "../../services/useMarketplaceCatalog";
import { lendingCoreTokens } from "../../theme/tokens";

const light = lendingCoreTokens.colors.light;
const dark = lendingCoreTokens.colors.dark;

export default function PartnerBankLogos(props: {
  banks?: CatalogBank[];
  loading?: boolean;
}) {
  const banks = props.banks || [];

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
          {banks.length ? `${banks.length} partner lenders on the platform` : "Trusted partner lenders"}
        </Typography>

        {props.loading ? (
          <Stack direction="row" spacing={2}>
            {[1, 2, 3, 4, 5].map((item) => (
              <Skeleton key={item} variant="rounded" width={96} height={30} />
            ))}
          </Stack>
        ) : null}

        {!props.loading && !banks.length ? (
          <Typography variant="body2" color="text.secondary">
            Partner logos will appear here once products are published.
          </Typography>
        ) : null}

        {!props.loading && banks.length ? (
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
              {banks.map((bank) => {
                const logoUrl = bank.LogoPath ? getFileProxyUrl(bank.LogoPath) : "";
                return (
                  <Box
                    key={bank._id}
                    component="img"
                    src={logoUrl}
                    alt={`${bank.Name} logo`}
                    loading="lazy"
                    draggable={false}
                    sx={(theme) => ({
                      height: { xs: 26, md: 30 },
                      width: "auto",
                      maxWidth: { xs: 96, md: 120 },
                      objectFit: "contain",
                      flexShrink: 0,
                      opacity: logoUrl ? 0.68 : 0.4,
                      filter: logoUrl ? "grayscale(100%)" : "none",
                      transition: "opacity 0.2s ease, filter 0.2s ease",
                      "&:hover": {
                        opacity: 0.92,
                        filter: logoUrl ? "grayscale(0%)" : "none",
                      },
                      ...theme.applyStyles("dark", {
                        opacity: logoUrl ? 0.78 : 0.4,
                        filter: logoUrl ? "grayscale(35%) brightness(1.12)" : "none",
                        "&:hover": {
                          opacity: 1,
                          filter: logoUrl ? "grayscale(0%) brightness(1.05)" : "none",
                        },
                      }),
                    })}
                  />
                );
              })}
            </Stack>
          </Box>
        ) : null}
      </PageContainer>
    </Box>
  );
}
