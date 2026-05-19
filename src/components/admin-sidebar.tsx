import Link from "next/link";

const adminItems = [
  { href: "/admin", label: "Visao Geral" },
  { href: "/admin/empresas", label: "Empresas" },
  { href: "/admin/usuarios", label: "Usuarios" },
  { href: "/admin/planos", label: "Planos" },
  { href: "/admin/assinaturas", label: "Assinaturas" },
  { href: "/admin/pagamentos", label: "Pagamentos" },
  { href: "/admin/logs", label: "Logs" }
];

export function AdminSidebar() {
  return (
    <aside className="flex min-h-screen w-72 flex-col border-r border-gray-200 bg-gray-950 px-5 py-6 text-white">
      <Link href="/admin" className="block">
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-300">
          PostIA Brasil
        </p>
        <p className="mt-2 text-xl font-semibold">Admin</p>
      </Link>

      <nav className="mt-10 space-y-1">
        {adminItems.map((item) => (
          <Link
            className="block rounded-md px-3 py-2 text-sm font-medium text-gray-300 transition hover:bg-white/10 hover:text-white"
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
