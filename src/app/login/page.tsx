"use client";

import dynamic from "next/dynamic";
const Login = dynamic(() => import("@/pages_old/Login"), { ssr: false });

export default function Page() {
  return (
    <Login />
  );
}
