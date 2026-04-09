"use client";

import dynamic from "next/dynamic";
const StudentLayout = dynamic(() => import("@/components/StudentLayout"), { ssr: false });
const TakeQuiz = dynamic(() => import("@/pages_old/student/TakeQuiz"), { ssr: false });

export default function Page() {
  return (
    
                <StudentLayout>
                  <TakeQuiz />
                </StudentLayout>
              
  );
}
