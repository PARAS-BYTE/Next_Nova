"use client";

import dynamic from "next/dynamic";
const StudentLayout = dynamic(() => import("@/components/StudentLayout"), { ssr: false });
const Calendar = dynamic(() => import("@/pages_old/student/Calendar"), { ssr: false });

export default function Page() {
  return (
    
                <StudentLayout>
                  <Calendar />
                </StudentLayout>
              
  );
}
