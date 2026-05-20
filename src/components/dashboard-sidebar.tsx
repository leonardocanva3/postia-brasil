import Link from "next/link";
import { AppLogo } from "@/components/app-logo";

const navigationItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/posts", label: "Posts" },
  { href: "/legendas", label: "Legendas" },
  { href: "/artes", label: "Artes" },
  { href: "/campanhas", label: "Campanhas" },
  { href: "/calendario", label: "Calendario" },
  { href: "/agendamentos", label: "Agendamentos" },
  { href: "/whatsapp", label: "WhatsApp" },
  { href: "/perfil", label: "Perfil da empresa" },
  { href: "/financeiro", label: "Financeiro" }
];

export function DashboardSidebar() {
  return (
    <aside className="flex w-full flex-col border-b border-gray-200 bg-white px-5 py-5 lg:min-h-screen lg:w-72 lg:border-b-0 lg:border-r lg:py-6">
      <Link href="/dashboard" className="block">
        <AppLogo size="sm" />
        <p className="mt-2 text-sm font-medium text-emerald-700">Workspace</p>
      </Link>

      <nav className="mt-6 flex gap-1 overflow-x-auto pb-1 lg:mt-10 lg:block lg:space-y-1 lg:overflow-visible lg:pb-0">
        {navigationItems.map((item) => (
          <Link
            className="block shrink-0 rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-gray-950"
            href={item.href}
            key={item.href}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
