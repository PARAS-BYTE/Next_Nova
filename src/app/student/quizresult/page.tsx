"use client";

import dynamic from "next/dynamic";
const StudentLayout = dynamic(() => import("@/components/StudentLayout"), { ssr: false });
const QuizAnalyzed = dynamic(() => import("@/pages_old/student/QuizAnalyzed"), { ssr: false });

export default function Page() {
  return (
    
                <StudentLayout>
                  <QuizAnalyzed/>
                </StudentLayout>
              
  );
}
