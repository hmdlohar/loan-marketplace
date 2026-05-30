import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import NextLink from "next/link";
import { APP_DESCRIPTION, APP_NAME } from "commonlib";
import AppLogo from "../../components/common/AppLogo";
import ThemeModeToggle from "../../components/common/ThemeModeToggle";
import LandingMobileNav from "./LandingMobileNav";

const navLinks = [
  { label: "Products", href: "/#products" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function LandingHeader() {
  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "background.paper",
        color: "text.primary",
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
        <Toolbar disableGutters sx={{ minHeight: { xs: 56, md: 72 }, gap: { xs: 0.75, md: 2 } }}>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Box sx={{ display: { xs: "block", sm: "none" } }}>
              <AppLogo href="/" size="sm" />
            </Box>
            <Box sx={{ display: { xs: "none", sm: "block" } }}>
              <AppLogo href="/" size="md" showName />
            </Box>
          </Box>
          <Stack direction="row" spacing={3} sx={{ display: { xs: "none", md: "flex" } }}>
            {navLinks.map((item) => (
              <Link
                key={item.href}
                component={NextLink}
                href={item.href}
                underline="none"
                color="text.secondary"
                sx={{ fontWeight: 600, fontSize: "0.875rem", "&:hover": { color: "primary.main" } }}
              >
                {item.label}
              </Link>
            ))}
          </Stack>
          <Stack direction="row" spacing={{ xs: 0.25, sm: 0.75 }} alignItems="center" sx={{ flexShrink: 0 }}>
            <ThemeModeToggle />
            <Button
              component={NextLink}
              href="/app/products"
              variant="contained"
              color="secondary"
              size="small"
              sx={{
                display: { xs: "none", sm: "inline-flex" },
                whiteSpace: "nowrap",
                px: { sm: 2 },
                flexShrink: 0,
              }}
            >
              Check eligibility
            </Button>
            <LandingMobileNav />
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export function LandingFooter() {
  return (
    <Box
      component="footer"
      sx={{
        py: 5,
        bgcolor: "background.paper",
        borderTop: 1,
        borderColor: "divider",
      }}
    >
      <Container maxWidth="lg">
        <Stack direction={{ xs: "column", md: "row" }} spacing={3} justifyContent="space-between">
          <Box>
            <Box sx={{ mb: 1.5 }}>
              <AppLogo size="sm" showName />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360 }}>
              {APP_DESCRIPTION}
            </Typography>
          </Box>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 3, sm: 4 }}>
            <Stack spacing={1}>
              <Typography variant="overline" color="text.secondary">
                Company
              </Typography>
              <Link component={NextLink} href="/about" color="text.primary" underline="hover">
                About
              </Link>
              <Link component={NextLink} href="/contact" color="text.primary" underline="hover">
                Contact
              </Link>
            </Stack>
            <Stack spacing={1}>
              <Typography variant="overline" color="text.secondary">
                Legal
              </Typography>
              <Link href="#" color="text.primary" underline="hover">
                Privacy
              </Link>
              <Link href="#" color="text.primary" underline="hover">
                Terms
              </Link>
            </Stack>
          </Stack>
        </Stack>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 4 }}>
          © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}
