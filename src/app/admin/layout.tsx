import { AdminSidebar } from "@/components/admin-sidebar";
import { requirePlatformAdmin } from "@/lib/admin/access";

type AdminLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default async function AdminLayout({ children }: AdminLayoutProps) {
  await requirePlatformAdmin();

  return (
    <div className="min-h-screen bg-gray-50 lg:flex">
      <AdminSidebar />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
