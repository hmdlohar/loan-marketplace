import config from "@root/config";

type Msg91Response = Record<string, unknown>;

const MSG91_WIDGET_API = "https://control.msg91.com/api/v5/widget";

function normalizeIndianMobile(mobile: string) {
  const digits = mobile.replace(/\D/g, "");
  if (digits.length === 10) {
    return digits;
  }
  if (digits.length === 12 && digits.startsWith("91")) {
    return digits.slice(2);
  }
  throw new Error("Enter a valid 10-digit mobile number.");
}

function extractMobileFromIdentifier(identifier: string) {
  const digits = identifier.replace(/\D/g, "");
  if (digits.length === 10) {
    return digits;
  }
  if (digits.length === 12 && digits.startsWith("91")) {
    return digits.slice(2);
  }
  throw new Error("MSG91 did not return a valid mobile number.");
}

function extractMobileFromWidgetResponse(parsed: Msg91Response, fallbackMobile?: string) {
  const data = parsed.data as Msg91Response | undefined;
  const candidates = [
    parsed.identifier,
    parsed.mobile,
    data?.identifier,
    data?.mobile,
  ];

  for (const value of candidates) {
    if (typeof value !== "string") {
      continue;
    }
    try {
      return extractMobileFromIdentifier(value);
    } catch {
      // try next field
    }
  }

  if (fallbackMobile) {
    return normalizeIndianMobile(fallbackMobile);
  }

  throw new Error("MSG91 did not return a mobile number.");
}

function mapMsg91ErrorMessage(message: string) {
  if (message === "AuthenticationFailure") {
    return "MSG91 authentication failed. Check MSG91_WIDGET_TOKEN and MSG91_AUTH_KEY in backend env.";
  }
  return message;
}

async function parseMsg91JsonResponse(response: Response) {
  const text = await response.text();
  let parsed: Msg91Response = {};
  try {
    parsed = JSON.parse(text) as Msg91Response;
  } catch {
    throw new Error(text || "MSG91 request failed.");
  }
  return parsed;
}

export async function msg91WidgetVerifyOtpServer(reqId: string, otp: string, fallbackMobile?: string) {
  if (!config.MSG91_WIDGET_ID) {
    throw new Error("MSG91_WIDGET_ID is not configured.");
  }
  if (!config.MSG91_WIDGET_TOKEN) {
    throw new Error("MSG91_WIDGET_TOKEN is not configured.");
  }

  const response = await fetch(`${MSG91_WIDGET_API}/verifyOtp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      widgetId: config.MSG91_WIDGET_ID,
      tokenAuth: config.MSG91_WIDGET_TOKEN,
      reqId: reqId.trim(),
      otp: otp.trim(),
    }),
  });

  const parsed = await parseMsg91JsonResponse(response);
  if (parsed.type !== "success") {
    const message = String(parsed.message || "Invalid OTP.");
    throw new Error(mapMsg91ErrorMessage(message));
  }

  return extractMobileFromWidgetResponse(parsed, fallbackMobile);
}

export async function msg91VerifyAccessTokenMobile(accessToken: string) {
  if (!config.MSG91_AUTH_KEY) {
    throw new Error("MSG91_AUTH_KEY is not configured.");
  }

  const token = accessToken.trim();
  if (!token) {
    throw new Error("Access token is required.");
  }

  const params = new URLSearchParams({
    authkey: config.MSG91_AUTH_KEY,
    "access-token": token,
  });

  if (config.MSG91_WIDGET_ID) {
    params.set("widgetId", config.MSG91_WIDGET_ID);
  }

  const response = await fetch(`${MSG91_WIDGET_API}/verifyAccessToken`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      authkey: config.MSG91_AUTH_KEY,
    },
    body: params.toString(),
  });

  const parsed = await parseMsg91JsonResponse(response);
  if (parsed.type !== "success") {
    const message = String(parsed.message || "Invalid access token.");
    throw new Error(mapMsg91ErrorMessage(message));
  }

  return extractMobileFromWidgetResponse(parsed);
}

export function msg91VerifyDevOtp(otp: string) {
  if (otp.trim() !== config.MSG91_OTP_DEV_CODE) {
    throw new Error("Invalid OTP.");
  }
}

export { normalizeIndianMobile };
