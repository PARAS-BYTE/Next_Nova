"use client";

import dynamic from "next/dynamic";
const StudentLayout = dynamic(() => import("@/components/StudentLayout"), { ssr: false });
const Courses = dynamic(() => import("@/pages_old/student/Courses"), { ssr: false });

export default function Page() {
  return (
    
                <StudentLayout>
                  <Courses />
                </StudentLayout>
              
  );
}
