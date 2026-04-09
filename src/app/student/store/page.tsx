"use client";

import dynamic from "next/dynamic";
const StudentLayout = dynamic(() => import("@/components/StudentLayout"), { ssr: false });
const Store = dynamic(() => import("@/pages_old/student/Store"), { ssr: false });

export default function Page() {
  return (
    
                <StudentLayout>
                  <Store />
                </StudentLayout>
              
  );
}
