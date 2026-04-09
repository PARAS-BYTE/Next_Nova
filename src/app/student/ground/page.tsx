"use client";

import dynamic from "next/dynamic";
const StudentLayout = dynamic(() => import("@/components/StudentLayout"), { ssr: false });
const StudyGroud = dynamic(() => import("@/pages_old/student/StudyGroud"), { ssr: false });

export default function Page() {
  return (
    
                // <StudentLayout>
                  <StudyGroud />
                // </StudentLayout>
              
  );
}
