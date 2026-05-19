import Link from "next/link";

const navigationItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/posts", label: "Posts" },
  { href: "/legendas", label: "Legendas" },
  { href: "/calendario", label: "Calendario" },
  { href: "/agendamentos", label: "Agendamentos" },
  { href: "/whatsapp", label: "WhatsApp" },
  { href: "/financeiro", label: "Financeiro" }
];

export function DashboardSidebar() {
  return (
    <aside className="flex min-h-screen w-72 flex-col border-r border-gray-200 bg-white px-5 py-6">
      <Link href="/dashboard" className="block">
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
          PostIA Brasil
        </p>
        <p className="mt-2 text-xl font-semibold text-gray-950">Workspace</p>
      </Link>

      <nav className="mt-10 space-y-1">
        {navigationItems.map((item) => (
          <Link
            className="block rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-gray-950"
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
