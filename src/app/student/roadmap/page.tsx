"use client";

import dynamic from "next/dynamic";
const StudentLayout = dynamic(() => import("@/components/StudentLayout"), { ssr: false });
const RoadMapInt = dynamic(() => import("@/pages_old/student/RoadMapInt"), { ssr: false });

export default function Page() {
  return (
    
                <StudentLayout>
                  <RoadMapInt />
                </StudentLayout>
              
  );
}
