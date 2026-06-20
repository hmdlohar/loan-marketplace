import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { APP_NAME } from "commonlib";
import AppLogo from "../common/AppLogo";
import AuthServices from "../../services/AuthServices";
import { bSdk } from "../../services/BackendSDKService";
import {
  MSG91_CAPTCHA_RENDER_ID,
  ensureMsg91WidgetReady,
  isMsg91CaptchaEnabled,
  msg91WidgetRetryOtp,
  msg91WidgetSendOtp,
  useDevOtpFlow,
} from "../../services/Msg91OtpService";

export default function OtpLoginPanel(props: {
  onSuccess: () => void;
  compact?: boolean;
}) {
  const [step, setStep] = useState<"mobile" | "otp">("mobile");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [reqId, setReqId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const devOtpFlow = useDevOtpFlow();

  useEffect(() => {
    if (!devOtpFlow) {
      ensureMsg91WidgetReady().catch(() => {
        setError("Failed to load MSG91 OTP widget.");
      });
    }
  }, [devOtpFlow]);

  const sendOtp = async () => {
    if (devOtpFlow) {
      const response = await bSdk.User_SendOtp({ Mobile: mobile });
      if (!response.status) {
        throw new Error(response.message || "Failed to send OTP.");
      }
      return;
    }

    const result = await msg91WidgetSendOtp(mobile);
    setReqId(result.reqId);
  };

  const verifyAndLogin = async () => {
    if (devOtpFlow) {
      const response = await bSdk.User_VerifyOtp({
        Mobile: mobile,
        Otp: otp,
      });
      if (!response.status || !response.data?.token) {
        throw new Error(response.message || "OTP verification failed.");
      }
      AuthServices.setToken(response.data.token);
      AuthServices.setUserData(response.data.user);
      props.onSuccess();
      return;
    }

    const response = await bSdk.User_VerifyOtp({
      Mobile: mobile,
      Otp: otp,
      ReqId: reqId,
    });
    if (!response.status || !response.data?.token) {
      throw new Error(response.message || "OTP verification failed.");
    }
    AuthServices.setToken(response.data.token);
    AuthServices.setUserData(response.data.user);
    props.onSuccess();
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: props.compact ? "100%" : 440,
        mx: "auto",
      }}
    >
      <Stack spacing={3}>
        {!props.compact ? (
          <Stack spacing={2} alignItems="center" textAlign="center">
            <AppLogo size="xl" />
            <Box>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                Continue with mobile OTP
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sign in to {APP_NAME} securely with a one-time password sent to your phone.
              </Typography>
            </Box>
          </Stack>
        ) : (
          <Box>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Verify your mobile number
            </Typography>
            <Typography variant="body2" color="text.secondary">
              We will send a one-time password to continue your application.
            </Typography>
          </Box>
        )}

        {!devOtpFlow && isMsg91CaptchaEnabled() ? (
          <Box
            id={MSG91_CAPTCHA_RENDER_ID}
            sx={{
              minHeight: 78,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          />
        ) : null}

        {step === "mobile" ? (
          <>
            <TextField
              label="Mobile number"
              value={mobile}
              onChange={(event) => setMobile(event.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="10-digit mobile"
              fullWidth
              inputProps={{ inputMode: "numeric" }}
            />
            <Button
              variant="contained"
              color="secondary"
              size="large"
              disabled={loading || mobile.length !== 10}
              onClick={async () => {
                setLoading(true);
                setError("");
                try {
                  await sendOtp();
                  setStep("otp");
                } catch (ex: any) {
                  setError(ex.response?.data?.message || ex.message || "Failed to send OTP.");
                } finally {
                  setLoading(false);
                }
              }}
            >
              {loading ? "Sending..." : "Send OTP"}
            </Button>
          </>
        ) : (
          <>
            <TextField
              label="Enter OTP"
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
              fullWidth
              inputProps={{ inputMode: "numeric" }}
            />
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                fullWidth
                disabled={loading || otp.length < 4}
                onClick={async () => {
                  setLoading(true);
                  setError("");
                  try {
                    await verifyAndLogin();
                  } catch (ex: any) {
                    setError(ex.response?.data?.message || ex.message || "OTP verification failed.");
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                {loading ? "Verifying..." : "Verify & continue"}
              </Button>
              <Button
                variant="outlined"
                disabled={loading}
                onClick={async () => {
                  setLoading(true);
                  setError("");
                  try {
                    if (devOtpFlow) {
                      await bSdk.User_SendOtp({ Mobile: mobile });
                    } else {
                      const result = await msg91WidgetRetryOtp(reqId);
                      setReqId(result.reqId);
                    }
                  } catch (ex: any) {
                    setError(ex.response?.data?.message || ex.message || "Failed to resend OTP.");
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                Resend
              </Button>
            </Stack>
            <Button
              variant="text"
              onClick={() => {
                setStep("mobile");
                setOtp("");
                setReqId("");
              }}
            >
              Change mobile number
            </Button>
          </>
        )}

        {error ? (
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        ) : null}
      </Stack>
    </Box>
  );
}
