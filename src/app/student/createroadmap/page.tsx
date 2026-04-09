"use client";

import dynamic from "next/dynamic";
const StudentLayout = dynamic(() => import("@/components/StudentLayout"), { ssr: false });
const CreateRoadmap = dynamic(() => import("@/pages_old/student/RoadMap"), { ssr: false });

export default function Page() {
  return (
    
                <StudentLayout>
                  <CreateRoadmap />
                </StudentLayout>
              
  );
}
