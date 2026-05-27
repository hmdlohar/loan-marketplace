import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import NextLink from "next/link";
import ThemeModeToggle from "../../components/common/ThemeModeToggle";

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
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ minHeight: 72, gap: 2 }}>
          <Typography
            component={NextLink}
            href="/"
            variant="h6"
            sx={{
              flexGrow: 1,
              fontWeight: 700,
              color: "primary.main",
              textDecoration: "none",
              letterSpacing: "-0.02em",
            }}
          >
            LendingCore
          </Typography>
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
          <ThemeModeToggle />
          <Button component={NextLink} href="/app/products" variant="contained" color="secondary" size="medium">
            Check eligibility
          </Button>
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
            <Typography variant="h6" fontWeight={700} gutterBottom color="primary.main">
              LendingCore
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360 }}>
              Compare loan offers from banks and NBFCs. Apply once, get matched to the right product.
            </Typography>
          </Box>
          <Stack direction="row" spacing={4}>
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
          © {new Date().getFullYear()} LendingCore. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}
