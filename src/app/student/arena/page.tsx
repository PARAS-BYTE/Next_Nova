"use client";

import dynamic from "next/dynamic";
const StudentLayout = dynamic(() => import("@/components/StudentLayout"), { ssr: false });
const Arena = dynamic(() => import("@/pages_old/student/Arena"), { ssr: false });

export default function Page() {
  return (
    
                <StudentLayout>
                  <Arena />
                </StudentLayout>
              
  );
}
