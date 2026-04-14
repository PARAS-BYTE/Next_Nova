"use client";
import dynamic from "next/dynamic";
const StudentLayout = dynamic(() => import("@/components/StudentLayout"), { ssr: false });
const Flashcards = dynamic(() => import("@/pages_old/student/Flashcards"), { ssr: false });

export default function FlashcardsPage() {
  return (
    <StudentLayout>
      <Flashcards />
    </StudentLayout>
  );
}
