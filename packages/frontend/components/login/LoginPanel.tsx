import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/router";
import { useState } from "react";
import { APP_NAME } from "commonlib";
import AppLogo from "../../components/common/AppLogo";
import AuthServices from "../../services/AuthServices";
import { bSdk } from "../../services/BackendSDKService";

export default function LoginPanel(props: { onSuccess: () => void }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        px: 2,
      }}
    >
      <Card sx={{ width: "100%", maxWidth: 440, boxShadow: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={3}>
            <Stack spacing={2} alignItems="center" textAlign="center">
              <AppLogo size="xl" />
              <Box>
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  Sign in to {APP_NAME}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Use your email and password to access your panel.
                </Typography>
              </Box>
            </Stack>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              fullWidth
              autoComplete="email"
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              fullWidth
              autoComplete="current-password"
            />
            {error ? (
              <Typography variant="body2" color="error">
                {error}
              </Typography>
            ) : null}
            <Button
              variant="contained"
              color="primary"
              size="large"
              disabled={loading || !email || !password}
              onClick={async () => {
                setLoading(true);
                setError("");
                try {
                  const response = await bSdk.User_Login({
                    Email: email.trim(),
                    Password: password,
                  });

                  if (!response.status || !response.data?.token) {
                    throw new Error(response.message || "Login failed.");
                  }

                  AuthServices.setToken(response.data.token);
                  AuthServices.setUserData(response.data.user);
                  props.onSuccess();
                  router.replace(AuthServices.getDefaultRoute());
                } catch (ex: any) {
                  setError(ex.response?.data?.message || ex.message || "Login failed.");
                } finally {
                  setLoading(false);
                }
              }}
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
