import Link from "next/link";
import { AppLogo } from "@/components/app-logo";

const adminItems = [
  { href: "/admin", label: "Visao Geral" },
  { href: "/admin/empresas", label: "Empresas" },
  { href: "/admin/usuarios", label: "Usuarios" },
  { href: "/admin/planos", label: "Planos" },
  { href: "/admin/assinaturas", label: "Assinaturas" },
  { href: "/admin/pagamentos", label: "Pagamentos" },
  { href: "/admin/ia", label: "IA / OpenAI" },
  { href: "/admin/logs", label: "Logs" }
];

export function AdminSidebar() {
  return (
    <aside className="flex w-full flex-col border-b border-gray-800 bg-gray-950 px-5 py-5 text-white lg:min-h-screen lg:w-72 lg:border-b-0 lg:border-r lg:py-6">
      <Link href="/admin" className="block">
        <AppLogo className="[&>span]:text-white" size="sm" />
        <p className="mt-2 text-sm font-medium text-emerald-300">Admin</p>
      </Link>

      <nav className="mt-6 flex gap-1 overflow-x-auto pb-1 lg:mt-10 lg:block lg:space-y-1 lg:overflow-visible lg:pb-0">
        {adminItems.map((item) => (
          <Link
            className="block shrink-0 rounded-md px-3 py-2 text-sm font-medium text-gray-300 transition hover:bg-white/10 hover:text-white"
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
