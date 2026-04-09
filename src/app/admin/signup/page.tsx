"use client";

import dynamic from "next/dynamic";
const AdminSignup = dynamic(() => import("@/pages_old/admin/AdminSignup"), { ssr: false });

export default function Page() {
  return (
    <AdminSignup />
  );
}
