import { useEffect, useState } from "react";
import LoginPanel from "../components/login/LoginPanel";
import OtpLoginPanel from "../components/login/OtpLoginPanel";
import AuthServices from "../services/AuthServices";
import { bSdk } from "../services/BackendSDKService";

export default function AuthGuard(props: {
  children: React.ReactNode;
  login?: "password" | "otp";
}) {
  const login = props.login || "password";
  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const token = AuthServices.getToken();
    const userData = AuthServices.getUserData();

    if (!token) {
      setAuthenticated(false);
      setReady(true);
      return;
    }

    if (AuthServices.isSessionValidated() && userData) {
      setAuthenticated(true);
      setReady(true);
      return;
    }

    if (userData) {
      setAuthenticated(true);
      setReady(true);
    }

    bSdk
      .User_GetProfile({})
      .then((response) => {
        if (response.status && response.data) {
          AuthServices.setUserData(response.data);
          AuthServices.markSessionValidated();
          setAuthenticated(true);
          return;
        }

        if (AuthServices.isAuthFailureResponse(response)) {
          AuthServices.onLogout();
          setAuthenticated(false);
          return;
        }

        if (!userData) {
          setAuthenticated(false);
        }
      })
      .catch((ex: any) => {
        if (AuthServices.isAuthFailureError(ex)) {
          AuthServices.onLogout();
          setAuthenticated(false);
          return;
        }

        if (!userData) {
          setAuthenticated(false);
        }
      })
      .finally(() => {
        setReady(true);
      });
  }, []);

  if (!ready) {
    return null;
  }

  if (!authenticated) {
    if (login === "otp") {
      return (
        <OtpLoginPanel
          onSuccess={() => {
            AuthServices.markSessionValidated();
            setAuthenticated(true);
          }}
        />
      );
    }

    return (
      <LoginPanel
        onSuccess={() => {
          AuthServices.markSessionValidated();
          setAuthenticated(true);
        }}
      />
    );
  }

  return <>{props.children}</>;
}
