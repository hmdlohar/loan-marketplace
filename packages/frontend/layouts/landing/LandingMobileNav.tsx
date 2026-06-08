import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import NextLink from "next/link";
import { useState } from "react";
import { APP_NAME } from "commonlib";

const navLinks = [
  { label: "Products", href: "/app/products" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const touchTargetSx = {
  minWidth: 44,
  minHeight: 44,
};

export default function LandingMobileNav() {
  const [open, setOpen] = useState(false);

  const close = () => {
    setOpen(false);
  };

  return (
    <>
      <IconButton
        aria-label="Open navigation menu"
        onClick={() => {
          setOpen(true);
        }}
        color="inherit"
        edge="end"
        sx={{
          display: { xs: "inline-flex", md: "none" },
          ...touchTargetSx,
        }}
      >
        <MenuIcon />
      </IconButton>

      <Drawer
        anchor="right"
        open={open}
        onClose={close}
        PaperProps={{
          sx: {
            width: "min(100vw - 48px, 320px)",
            px: 2,
            py: 2,
          },
        }}
      >
        <Stack spacing={2} sx={{ height: "100%" }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="subtitle1" fontWeight={700} color="primary.main">
              {APP_NAME}
            </Typography>
            <IconButton aria-label="Close navigation menu" onClick={close} sx={touchTargetSx}>
              <CloseIcon />
            </IconButton>
          </Stack>

          <Divider />

          <List disablePadding sx={{ flex: 1 }}>
            {navLinks.map((item) => (
              <ListItemButton
                key={item.href}
                component={NextLink}
                href={item.href}
                onClick={close}
                sx={{ minHeight: 48, borderRadius: 1 }}
              >
                <ListItemText
                  primary={item.label}
                  slotProps={{ primary: { fontWeight: 600, fontSize: "0.9375rem" } }}
                />
              </ListItemButton>
            ))}
          </List>

          <Box sx={{ pt: 1 }}>
            <Button
              component={NextLink}
              href="/app/products"
              variant="contained"
              color="secondary"
              fullWidth
              size="large"
              onClick={close}
            >
              Browse products
            </Button>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.5, textAlign: "center" }}>
              Compare offers from partner lenders
            </Typography>
          </Box>
        </Stack>
      </Drawer>
    </>
  );
}
