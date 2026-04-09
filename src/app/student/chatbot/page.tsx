"use client";

import dynamic from "next/dynamic";
const StudentLayout = dynamic(() => import("@/components/StudentLayout"), { ssr: false });
const ChatBot = dynamic(() => import("@/pages_old/student/ChatBot"), { ssr: false });

export default function Page() {
  return (
    
                <StudentLayout>
                  <ChatBot />
                </StudentLayout>
              
  );
}
