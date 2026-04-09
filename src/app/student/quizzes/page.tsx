"use client";

import dynamic from "next/dynamic";
const StudentLayout = dynamic(() => import("@/components/StudentLayout"), { ssr: false });
const Quizzes = dynamic(() => import("@/pages_old/student/Quizzes"), { ssr: false });

export default function Page() {
  return (
    
                <StudentLayout>
                  <Quizzes />
                </StudentLayout>
              
  );
}
