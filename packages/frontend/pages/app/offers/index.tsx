import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";

const OffersRedirectPage: NextPage = () => {
  const router = useRouter();
  const applicationId = typeof router.query.applicationId === "string" ? router.query.applicationId : "";

  useEffect(() => {
    if (!router.isReady) {
      return;
    }
    if (applicationId) {
      router.replace(`/app/apply/recommendations?applicationId=${applicationId}`);
      return;
    }
    router.replace("/app/dashboard");
  }, [router, applicationId]);

  return null;
};

export default OffersRedirectPage;
