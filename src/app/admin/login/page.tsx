"use client";

import dynamic from "next/dynamic";
const AdminLogin = dynamic(() => import("@/pages_old/admin/AdminLogin"), { ssr: false });

export default function Page() {
  return (
    <AdminLogin />
  );
}
