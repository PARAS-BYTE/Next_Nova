"use client";

import dynamic from "next/dynamic";
const Landing = dynamic(() => import("@/pages_old/Landing"), { ssr: false });

export default function Page() {
  return (
    <Landing />
  );
}
