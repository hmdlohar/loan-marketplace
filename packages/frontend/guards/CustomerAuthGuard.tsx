import { useEffect, useState } from "react";
import OtpLoginPanel from "../components/login/OtpLoginPanel";
import AuthServices from "../services/AuthServices";

export default function CustomerAuthGuard(props: { children: React.ReactNode }) {
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
      <OtpLoginPanel
        onSuccess={() => {
          setAuthenticated(true);
        }}
      />
    );
  }

  return <>{props.children}</>;
}
