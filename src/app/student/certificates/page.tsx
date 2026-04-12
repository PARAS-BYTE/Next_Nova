"use client";
import dynamic from 'next/dynamic';
const StudentLayout = dynamic(() => import("@/components/StudentLayout"), { ssr: false });
const CertificatesContent = dynamic(() => import('@/pages_old/student/Certificates'), {
  ssr: false,
});

export default function CertificatesPage() {
  return (
    <StudentLayout>
      <CertificatesContent />
    </StudentLayout>
  );
}
