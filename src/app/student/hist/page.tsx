"use client";

import dynamic from "next/dynamic";
const StudentLayout = dynamic(() => import("@/components/StudentLayout"), { ssr: false });
const History = dynamic(() => import("@/pages_old/student/History"), { ssr: false });

export default function Page() {
  return (
    
                <StudentLayout>
                  <History />
                </StudentLayout>
              
  );
}
