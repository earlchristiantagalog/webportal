import { Suspense, type ReactNode } from "react";
import { redirect } from "next/navigation";
import { hasAdminSession, isAdminConfigured } from "@/backend/lib/admin-auth";

async function AdminGate({ children }: { children: ReactNode }) {
  if (process.env.NODE_ENV === "production") {
    if (!isAdminConfigured() || !(await hasAdminSession())) redirect("/");
  }
  return children;
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <Suspense fallback={<div role="status" className="p-4">Checking admin access...</div>}><AdminGate>{children}</AdminGate></Suspense>;
}
