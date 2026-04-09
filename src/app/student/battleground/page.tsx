"use client";

import dynamic from "next/dynamic";
const StudentLayout = dynamic(() => import("@/components/StudentLayout"), { ssr: false });
const BattleLive = dynamic(() => import("@/pages_old/student/BattleLive"), { ssr: false });

export default function Page() {
  return (
    
                <StudentLayout>
                  <BattleLive />
                </StudentLayout>
              
  );
}
