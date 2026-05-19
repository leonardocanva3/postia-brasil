import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import { DashboardSidebar } from "@/components/dashboard-sidebar";

type PrivateLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default async function PrivateLayout({ children }: PrivateLayoutProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 lg:flex">
      <DashboardSidebar />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
