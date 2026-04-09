"use client";

import dynamic from "next/dynamic";
const StudentLayout = dynamic(() => import("@/components/StudentLayout"), { ssr: false });
const Summary = dynamic(() => import("@/pages_old/student/Summary"), { ssr: false });

export default function Page() {
  return (
    
                <StudentLayout>
                  <Summary />
                </StudentLayout>
              
  );
}
