"use client";

import dynamic from "next/dynamic";
const StudentLayout = dynamic(() => import("@/components/StudentLayout"), { ssr: false });
const Notion = dynamic(() => import("@/pages_old/student/Notion"), { ssr: false });

export default function Page() {
  return (
    
                <StudentLayout>
                  <Notion />
                </StudentLayout>
              
  );
}
