"use client";

import dynamic from "next/dynamic";
const StudentLayout = dynamic(() => import("@/components/StudentLayout"), { ssr: false });
const Forum = dynamic(() => import("@/pages_old/student/Forum"), { ssr: false });

export default function Page() {
  return (
    
                <StudentLayout>
                  <Forum />
                </StudentLayout>
              
  );
}
