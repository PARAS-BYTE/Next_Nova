"use client";

import dynamic from "next/dynamic";
const StudentLayout = dynamic(() => import("@/components/StudentLayout"), { ssr: false });
const Settings = dynamic(() => import("@/pages_old/student/Settings"), { ssr: false });

export default function Page() {
  return (
    
                <StudentLayout>
                  <Settings />
                </StudentLayout>
              
  );
}
