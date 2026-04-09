"use client";

import dynamic from "next/dynamic";
const StudentLayout = dynamic(() => import("@/components/StudentLayout"), { ssr: false });
const StudentDashboard = dynamic(() => import("@/pages_old/student/Dashboard"), { ssr: false });

export default function Page() {
  return (
    
                <StudentLayout>
                  <StudentDashboard />
                </StudentLayout>
              
  );
}
