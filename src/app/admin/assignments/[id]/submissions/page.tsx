"use client";

import dynamic from "next/dynamic";
const AssignmentSubmissions = dynamic(() => import("@/pages_old/admin/AssignmentSubmissions"), { ssr: false });
const AdminRoutes = dynamic(() => import("@/pages_old/AdminRoutes"), { ssr: false });
const AdminLayout = dynamic(() => import("@/components/AdminLayout"), { ssr: false });

export default function Page() {
  return (
    
                <AdminRoutes>
                  <AdminLayout>
                    <AssignmentSubmissions />
                  </AdminLayout>
                </AdminRoutes>
              
  );
}
