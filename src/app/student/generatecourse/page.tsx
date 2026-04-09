"use client";

import dynamic from "next/dynamic";
const StudentLayout = dynamic(() => import("@/components/StudentLayout"), { ssr: false });
const AutoGenerateCourse = dynamic(() => import("@/pages_old/student/AutoCourseGeneration"), { ssr: false });

export default function Page() {
  return (
    
                <StudentLayout>
                  <AutoGenerateCourse />
                </StudentLayout>
              
  );
}
