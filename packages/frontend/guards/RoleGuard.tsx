import { USER_ROLE } from "commonlib";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import AuthServices from "../services/AuthServices";

export default function RoleGuard(props: { children: React.ReactNode; roles: string[] }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const role = AuthServices.getRole();
    const roleAllowed = props.roles.includes(role);

    if (!roleAllowed) {
      router.replace(AuthServices.getDefaultRoute());
      setAllowed(false);
    } else {
      setAllowed(true);
    }

    setReady(true);
  }, [props.roles, router]);

  if (!ready || !allowed) {
    return null;
  }

  return <>{props.children}</>;
}

export function isRoleAllowed(roles: string[]) {
  const role = AuthServices.getRole();
  return roles.includes(role);
}

export { USER_ROLE };
