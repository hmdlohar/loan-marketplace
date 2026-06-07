import type { NextPage } from "next";
import { useEffect } from "react";
import { useRouter } from "next/router";

const AdminIndexPage: NextPage = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/partners");
  }, [router]);

  return null;
};

export default AdminIndexPage;
