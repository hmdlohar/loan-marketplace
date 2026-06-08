import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import AppLogo from "../../components/common/AppLogo";
import ThemeModeToggle from "../../components/common/ThemeModeToggle";
import AuthServices from "../../services/AuthServices";

const navLinks = [
  { label: "Browse products", href: "/app/products", icon: AccountBalanceOutlinedIcon },
  { label: "My applications", href: "/app/dashboard", icon: DashboardOutlinedIcon, auth: true },
];

export default function CustomerAppLayout(props: { children: React.ReactNode }) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAuthenticated = AuthServices.isAuthenticated();
  const userData = AuthServices.getUserData() as { FullName?: string; Mobile?: string } | null;

  const drawer = (
    <Box sx={{ width: 280, p: 2 }}>
      <Stack spacing={3}>
        <AppLogo href="/" size="sm" showName />
        <Stack spacing={1}>
          {navLinks.map((item) => {
            if (item.auth && !isAuthenticated) {
              return null;
            }
            const Icon = item.icon;
            return (
              <Button
                key={item.href}
                component={NextLink}
                href={item.href}
                startIcon={<Icon />}
                variant={router.pathname.startsWith(item.href) ? "contained" : "text"}
                color={router.pathname.startsWith(item.href) ? "secondary" : "inherit"}
                sx={{ justifyContent: "flex-start" }}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Button>
            );
          })}
          <Button component={NextLink} href="/" startIcon={<HomeOutlinedIcon />} variant="text" sx={{ justifyContent: "flex-start" }}>
            Back to home
          </Button>
        </Stack>
        {isAuthenticated ? (
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<LogoutOutlinedIcon />}
            onClick={() => {
              AuthServices.onLogout();
              window.location.href = "/app/products";
            }}
          >
            Sign out
          </Button>
        ) : null}
      </Stack>
    </Box>
  );

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "rgba(255,255,255,0.82)",
          backdropFilter: "blur(12px)",
          color: "text.primary",
          borderBottom: 1,
          borderColor: "divider",
          ...((theme) =>
            theme.applyStyles("dark", {
              bgcolor: "rgba(18, 18, 18, 0.82)",
            })),
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ minHeight: { xs: 64, md: 72 } }}>
            <IconButton edge="start" sx={{ mr: 1, display: { md: "none" } }} onClick={() => setMobileOpen(true)}>
              <MenuIcon />
            </IconButton>
            <AppLogo href="/" size="sm" showName />
            <Box sx={{ flexGrow: 1 }} />
            <Stack direction="row" spacing={1} alignItems="center" sx={{ display: { xs: "none", md: "flex" } }}>
              {navLinks.map((item) => {
                if (item.auth && !isAuthenticated) {
                  return null;
                }
                return (
                  <Button
                    key={item.href}
                    component={NextLink}
                    href={item.href}
                    color={router.pathname.startsWith(item.href) ? "secondary" : "inherit"}
                    variant={router.pathname.startsWith(item.href) ? "contained" : "text"}
                  >
                    {item.label}
                  </Button>
                );
              })}
              <ThemeModeToggle />
            </Stack>
            <Box sx={{ display: { xs: "flex", md: "none" } }}>
              <ThemeModeToggle />
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)}>
        {drawer}
      </Drawer>

      <Box
        component="main"
        sx={{
          pb: 6,
          background: (theme) =>
            `linear-gradient(180deg, ${theme.palette.secondary.main}08 0%, transparent 220px)`,
        }}
      >
        {props.children}
      </Box>

      {isAuthenticated ? (
        <Box
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            display: { xs: "block", md: "none" },
            borderTop: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
            zIndex: 10,
          }}
        >
          <Stack direction="row">
            <Button fullWidth component={NextLink} href="/app/products" color="secondary">
              Browse
            </Button>
            <Button fullWidth component={NextLink} href="/app/dashboard">
              Applications
            </Button>
          </Stack>
        </Box>
      ) : null}

      {!isAuthenticated ? null : (
        <Typography variant="caption" color="text.secondary" sx={{ display: { xs: "none", md: "block" }, textAlign: "right", px: 3, pb: 2 }}>
          Signed in as {userData?.FullName || userData?.Mobile}
        </Typography>
      )}
    </Box>
  );
}
