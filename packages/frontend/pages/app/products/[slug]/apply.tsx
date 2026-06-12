import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";

const ProductApplyRedirectPage: NextPage = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace("/app/apply");
  }, [router]);

  return null;
};

export default ProductApplyRedirectPage;
