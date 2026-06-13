import type { Msg91OtpCallbackData } from "../types/msg91-otp-window";

const MSG91_OTP_SCRIPT_SRC = "https://verify.msg91.com/otp-provider.js";
const MSG91_CAPTCHA_ELEMENT_ID = "msg91-captcha";

let initPromise: Promise<void> | null = null;

function mapMsg91ClientError(message: string) {
  if (message === "AuthenticationFailure") {
    return "MSG91 could not verify this OTP session. Request a new OTP and try again. If it persists, re-check widget token and auth key in MSG91.";
  }
  return message;
}

export const MSG91_CAPTCHA_RENDER_ID = MSG91_CAPTCHA_ELEMENT_ID;

export function isMsg91WidgetConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_MSG91_WIDGET_ID && process.env.NEXT_PUBLIC_MSG91_WIDGET_TOKEN);
}

export function useDevOtpFlow() {
  return process.env.NEXT_PUBLIC_MSG91_OTP_DEV_MODE === "true" || !isMsg91WidgetConfigured();
}

export function isMsg91CaptchaEnabled() {
  return process.env.NEXT_PUBLIC_MSG91_WIDGET_CAPTCHA !== "false";
}

function getMsg91Window() {
  if (typeof window === "undefined") {
    throw new Error("MSG91 widget is only available in the browser.");
  }
  return window;
}

function getWidgetCredentials() {
  const widgetId = process.env.NEXT_PUBLIC_MSG91_WIDGET_ID;
  const tokenAuth = process.env.NEXT_PUBLIC_MSG91_WIDGET_TOKEN;
  if (!widgetId || !tokenAuth) {
    throw new Error("MSG91 widget is not configured.");
  }
  return { widgetId, tokenAuth };
}

function getCallbackErrorMessage(error: Msg91OtpCallbackData | string | undefined, fallback: string) {
  if (!error) {
    return fallback;
  }
  if (typeof error === "string") {
    return mapMsg91ClientError(error);
  }
  return mapMsg91ClientError(error.message || fallback);
}

function assertMsg91Success(data: Msg91OtpCallbackData | undefined, fallbackMessage: string) {
  if (!data || data.type !== "success") {
    throw new Error(getCallbackErrorMessage(data, fallbackMessage));
  }
  return data;
}

async function waitForMsg91Methods(msg91Window: Window, attempts = 20) {
  for (let index = 0; index < attempts; index += 1) {
    if (msg91Window.sendOtp && msg91Window.verifyOtp && msg91Window.retryOtp) {
      return;
    }
    await new Promise((resolve) => window.setTimeout(resolve, 50));
  }
  throw new Error("MSG91 OTP methods are not available.");
}

function loadMsg91OtpScript(): Promise<void> {
  const msg91Window = getMsg91Window();
  if (msg91Window.sendOtp && msg91Window.verifyOtp && msg91Window.retryOtp) {
    return Promise.resolve();
  }

  const existingScript = document.querySelector(`script[src="${MSG91_OTP_SCRIPT_SRC}"]`);
  if (existingScript) {
    return new Promise((resolve, reject) => {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => reject(new Error("Failed to load MSG91 OTP provider.")), {
        once: true,
      });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = MSG91_OTP_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load MSG91 OTP provider."));
    document.body.appendChild(script);
  });
}

export async function ensureMsg91WidgetReady() {
  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    const { widgetId, tokenAuth } = getWidgetCredentials();
    await loadMsg91OtpScript();

    const msg91Window = getMsg91Window();
    if (!msg91Window.initSendOTP) {
      throw new Error("MSG91 OTP provider failed to initialize.");
    }

    msg91Window.initSendOTP({
      widgetId,
      tokenAuth,
      exposeMethods: true,
      ...(isMsg91CaptchaEnabled()
        ? { captchaRenderId: MSG91_CAPTCHA_ELEMENT_ID }
        : {}),
      // Required by otp-provider.js even when using per-method callbacks.
      success: () => {},
      failure: () => {},
    });

    await waitForMsg91Methods(msg91Window);
  })();

  try {
    await initPromise;
  } catch (error) {
    initPromise = null;
    throw error;
  }
}

export async function msg91WidgetSendOtp(mobile10: string) {
  await ensureMsg91WidgetReady();
  const msg91Window = getMsg91Window();

  if (isMsg91CaptchaEnabled() && msg91Window.isCaptchaVerified && !msg91Window.isCaptchaVerified()) {
    throw new Error("Please complete captcha verification.");
  }

  return new Promise<{ reqId: string }>((resolve, reject) => {
    msg91Window.sendOtp!(
      `91${mobile10}`,
      (data) => {
        try {
          const response = assertMsg91Success(data, "Failed to send OTP.");
          const reqId = response.reqId || response.message;
          if (!reqId) {
            throw new Error("MSG91 did not return an OTP request id.");
          }
          resolve({ reqId });
        } catch (error) {
          reject(error);
        }
      },
      (error) => reject(new Error(getCallbackErrorMessage(error, "Failed to send OTP.")))
    );
  });
}

export async function msg91WidgetRetryOtp(reqId: string) {
  await ensureMsg91WidgetReady();
  const msg91Window = getMsg91Window();

  return new Promise<{ reqId: string }>((resolve, reject) => {
    msg91Window.retryOtp!(
      null,
      (data) => {
        try {
          const response = assertMsg91Success(data, "Failed to resend OTP.");
          const nextReqId = response.reqId || response.message || reqId;
          resolve({ reqId: nextReqId });
        } catch (error) {
          reject(error);
        }
      },
      (error) => reject(new Error(getCallbackErrorMessage(error, "Failed to resend OTP."))),
      reqId
    );
  });
}
