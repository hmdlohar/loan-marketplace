import config from "@root/config";

type Msg91Response = {
  type?: string;
  message?: string;
};

function normalizeIndianMobile(mobile: string) {
  const digits = mobile.replace(/\D/g, "");
  if (digits.length === 10) {
    return `91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith("91")) {
    return digits;
  }
  throw new Error("Enter a valid 10-digit mobile number.");
}

async function parseMsg91Response(response: Response) {
  const text = await response.text();
  let parsed: Msg91Response = {};
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error(text || "MSG91 request failed.");
  }
  if (parsed.type !== "success") {
    throw new Error(parsed.message || "MSG91 request failed.");
  }
  return parsed;
}

export async function msg91SendOtp(mobile: string) {
  if (config.MSG91_OTP_DEV_MODE) {
    return { type: "success", message: "Dev OTP mode enabled." };
  }

  if (!config.MSG91_AUTH_KEY) {
    throw new Error("MSG91_AUTH_KEY is not configured.");
  }

  const normalizedMobile = normalizeIndianMobile(mobile);
  const params = new URLSearchParams({
    authkey: config.MSG91_AUTH_KEY,
    mobile: normalizedMobile,
    otp_expiry: String(config.MSG91_OTP_EXPIRY_MINUTES || 10),
    otp_length: String(config.MSG91_OTP_LENGTH || 6),
  });

  if (config.MSG91_SENDER_ID) {
    params.set("sender", config.MSG91_SENDER_ID);
  }

  const response = await fetch(`https://api.msg91.com/api/sendotp.php?${params.toString()}`);
  return parseMsg91Response(response);
}

export async function msg91VerifyOtp(mobile: string, otp: string) {
  if (config.MSG91_OTP_DEV_MODE) {
    if (otp.trim() !== config.MSG91_OTP_DEV_CODE) {
      throw new Error("Invalid OTP.");
    }
    return { type: "success", message: "Dev OTP verified." };
  }

  if (!config.MSG91_AUTH_KEY) {
    throw new Error("MSG91_AUTH_KEY is not configured.");
  }

  const normalizedMobile = normalizeIndianMobile(mobile);
  const params = new URLSearchParams({
    authkey: config.MSG91_AUTH_KEY,
    mobile: normalizedMobile,
    otp: otp.trim(),
  });

  const response = await fetch(`https://api.msg91.com/api/verifyRequestOTP.php?${params.toString()}`);
  return parseMsg91Response(response);
}

export async function msg91ResendOtp(mobile: string) {
  if (!config.MSG91_AUTH_KEY) {
    throw new Error("MSG91_AUTH_KEY is not configured.");
  }

  const normalizedMobile = normalizeIndianMobile(mobile);
  const params = new URLSearchParams({
    authkey: config.MSG91_AUTH_KEY,
    mobile: normalizedMobile,
    retrytype: "text",
  });

  const response = await fetch(`https://api.msg91.com/api/retryotp.php?${params.toString()}`);
  return parseMsg91Response(response);
}

export { normalizeIndianMobile };
