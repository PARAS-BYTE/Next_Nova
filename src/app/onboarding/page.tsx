"use client";

import dynamic from "next/dynamic";
const Onboarding = dynamic(() => import("@/pages_old/Onboarding"), { ssr: false });

export default function Page() {
  return (
    <Onboarding />
  );
}
