"use client";

import dynamic from "next/dynamic";
const StudentLayout = dynamic(() => import("@/components/StudentLayout"), { ssr: false });
const Assignments = dynamic(() => import("@/pages_old/student/Assignments"), { ssr: false });

export default function Page() {
  return (
    
                <StudentLayout>
                  <Assignments />
                </StudentLayout>
              
  );
}
