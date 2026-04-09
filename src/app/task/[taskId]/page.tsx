"use client";

import dynamic from "next/dynamic";
const StudentLayout = dynamic(() => import("@/components/StudentLayout"), { ssr: false });
const DailyTask = dynamic(() => import("@/pages_old/student/DailyTask"), { ssr: false });

export default function Page() {
  return (
    
                // <StudentLayout>
                  <DailyTask />
                // </StudentLayout>
              
  );
}
