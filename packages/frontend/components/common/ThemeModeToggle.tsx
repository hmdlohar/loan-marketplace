import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { useColorScheme } from "@mui/material/styles";
import { useEffect, useState } from "react";

export default function ThemeModeToggle() {
  const colorScheme = useColorScheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const resolvedMode = colorScheme.mode === "system" ? colorScheme.systemMode : colorScheme.mode;
  const isDark = resolvedMode === "dark";
  const nextMode = isDark ? "light" : "dark";
  const label = isDark ? "Switch to light mode" : "Switch to dark mode";

  if (!mounted) {
    return (
      <IconButton size="small" color="inherit" aria-hidden sx={{ visibility: "hidden" }}>
        <DarkModeOutlinedIcon fontSize="small" />
      </IconButton>
    );
  }

  return (
    <Tooltip title={label}>
      <IconButton
        aria-label={label}
        onClick={() => {
          colorScheme.setMode(nextMode);
        }}
        size="small"
        color="inherit"
        sx={{ minWidth: 44, minHeight: 44 }}
      >
        {isDark ? <LightModeOutlinedIcon fontSize="small" /> : <DarkModeOutlinedIcon fontSize="small" />}
      </IconButton>
    </Tooltip>
  );
}
