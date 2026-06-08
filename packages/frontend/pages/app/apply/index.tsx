import { useEffect } from "react";
import { useRouter } from "next/router";

export default function LegacyApplyRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/app/products");
  }, [router]);

  return null;
}
