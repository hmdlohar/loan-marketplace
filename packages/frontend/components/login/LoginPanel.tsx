import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { APP_NAME } from "commonlib";
import AppLogo from "../../components/common/AppLogo";
import AuthServices from "../../services/AuthServices";

export default function LoginPanel(props: { onSuccess: () => void }) {
  const [mobile, setMobile] = useState("9876543210");
  const [loading, setLoading] = useState(false);

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
                  Use your mobile number to access your loan application. Backend auth will replace this mock flow.
                </Typography>
              </Box>
            </Stack>
            <TextField
              label="Mobile number"
              value={mobile}
              onChange={(event) => setMobile(event.target.value)}
              fullWidth
              inputProps={{ inputMode: "numeric" }}
            />
            <Button
              variant="contained"
              color="primary"
              size="large"
              disabled={loading || mobile.length < 10}
              onClick={() => {
                setLoading(true);
                AuthServices.setToken("mock-demo-token");
                AuthServices.setUserData({
                  FullName: "Demo Borrower",
                  Mobile: mobile,
                  Role: "CUSTOMER",
                });
                props.onSuccess();
              }}
            >
              Continue
            </Button>
            <Typography variant="caption" color="text.secondary" textAlign="center">
              Mock login — no OTP sent. For UI development only.
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
