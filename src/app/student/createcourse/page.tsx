"use client";

import dynamic from "next/dynamic";
const StudentLayout = dynamic(() => import("@/components/StudentLayout"), { ssr: false });
const CreateCourse = dynamic(() => import("@/pages_old/student/CreateCourse"), { ssr: false });

export default function Page() {
  return (
    
                <StudentLayout>
                  <CreateCourse/>
                </StudentLayout>
              
  );
}
