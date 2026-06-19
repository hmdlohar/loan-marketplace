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
    if (!token) {
      setAuthenticated(false);
      setReady(true);
      return;
    }

    bSdk
      .User_GetProfile({})
      .then((response) => {
        if (response.status && response.data) {
          AuthServices.setUserData(response.data);
          setAuthenticated(true);
          return;
        }
        AuthServices.onLogout();
        setAuthenticated(false);
      })
      .catch(() => {
        AuthServices.onLogout();
        setAuthenticated(false);
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
            setAuthenticated(true);
          }}
        />
      );
    }

    return (
      <LoginPanel
        onSuccess={() => {
          setAuthenticated(true);
        }}
      />
    );
  }

  return <>{props.children}</>;
}
