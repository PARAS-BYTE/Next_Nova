"use client";

import dynamic from "next/dynamic";
const StudentLayout = dynamic(() => import("@/components/StudentLayout"), { ssr: false });
const PlaylistExtractor = dynamic(() => import("@/pages_old/student/PlaylistExtracter"), { ssr: false });

export default function Page() {
  return (
    
                <StudentLayout>
                  <PlaylistExtractor />
                </StudentLayout>
              
  );
}
