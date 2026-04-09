"use client";

import dynamic from "next/dynamic";
const AdminSettings = dynamic(() => import("@/pages_old/admin/Settings"), { ssr: false });
const AdminRoutes = dynamic(() => import("@/pages_old/AdminRoutes"), { ssr: false });
const AdminLayout = dynamic(() => import("@/components/AdminLayout"), { ssr: false });

export default function Page() {
  return (
    
                <AdminRoutes>
                  <AdminLayout>
                    <AdminSettings />
                  </AdminLayout>
                </AdminRoutes>
              
  );
}
