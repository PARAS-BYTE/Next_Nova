"use client";

import dynamic from "next/dynamic";
const StudentLayout = dynamic(() => import("@/components/StudentLayout"), { ssr: false });
const MyLearning = dynamic(() => import("@/pages_old/student/MyLearning"), { ssr: false });

export default function Page() {
  return (
    
                <StudentLayout>
                  <MyLearning />
                </StudentLayout>
              
  );
}
