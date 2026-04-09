"use client";

import dynamic from "next/dynamic";
const StudentLayout = dynamic(() => import("@/components/StudentLayout"), { ssr: false });
const RoadMapDisplay = dynamic(() => import("@/pages_old/student/RoadMapDisplay"), { ssr: false });

export default function Page() {
  return (
    
                <StudentLayout>
                  <RoadMapDisplay />
                </StudentLayout>
              
  );
}
