"use client";

import dynamic from "next/dynamic";
const AdminCourses = dynamic(() => import("@/pages_old/admin/Courses"), { ssr: false });
const AdminRoutes = dynamic(() => import("@/pages_old/AdminRoutes"), { ssr: false });
const AdminLayout = dynamic(() => import("@/components/AdminLayout"), { ssr: false });

export default function Page() {
  return (
    
                <AdminRoutes>
                  <AdminLayout>
                    <AdminCourses />
                  </AdminLayout>
                </AdminRoutes>
              
  );
}
