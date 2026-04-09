"use client";

import dynamic from "next/dynamic";
const Signup = dynamic(() => import("@/pages_old/Signup"), { ssr: false });

export default function Page() {
  return (
    <Signup />
  );
}
