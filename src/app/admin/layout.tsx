import type { ReactNode } from "react";
import AdminHeader from "@/src/components/admin/AdminHeader";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <style>{`#global-header { display: none !important; }`}</style>
      <AdminHeader />
      {children}
    </>
  );
}
