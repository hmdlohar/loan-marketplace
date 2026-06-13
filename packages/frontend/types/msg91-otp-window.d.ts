export type Msg91OtpCallbackData = {
  type?: string;
  message?: string;
  reqId?: string;
  accessToken?: string;
  token?: string;
};

declare global {
  interface Window {
    initSendOTP?: (configuration: Record<string, unknown>) => void;
    sendOtp?: (
      identifier: string,
      success?: (data: Msg91OtpCallbackData) => void,
      failure?: (error: Msg91OtpCallbackData | string) => void
    ) => void;
    retryOtp?: (
      retryChannel: string | null,
      success?: (data: Msg91OtpCallbackData) => void,
      failure?: (error: Msg91OtpCallbackData | string) => void,
      reqId?: string
    ) => void;
    verifyOtp?: (
      otp: string,
      success?: (data: Msg91OtpCallbackData) => void,
      failure?: (error: Msg91OtpCallbackData | string) => void,
      reqId?: string
    ) => void;
    getWidgetData?: () => unknown;
    isCaptchaVerified?: () => boolean;
  }
}

export {};
