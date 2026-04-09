"use client";

import dynamic from "next/dynamic";
const StudentLayout = dynamic(() => import("@/components/StudentLayout"), { ssr: false });
const BattleShow = dynamic(() => import("@/pages_old/student/BattleShow"), { ssr: false });

export default function Page() {
  return (
    
                <StudentLayout>
                  <BattleShow />
                </StudentLayout>
              
  );
}
