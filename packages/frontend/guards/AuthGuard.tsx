import { useEffect, useState } from "react";
import LoginPanel from "../components/login/LoginPanel";
import AuthServices from "../services/AuthServices";

export default function AuthGuard(props: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    setAuthenticated(AuthServices.isAuthenticated());
    setReady(true);
  }, []);

  if (!ready) {
    return null;
  }

  if (!authenticated) {
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
