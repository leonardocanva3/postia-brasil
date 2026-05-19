import { formatDate } from "@/lib/admin/format";
import { prisma } from "@/lib/database/prisma";

export const dynamic = "force-dynamic";

export default async function AdminUsuariosPage() {
  const memberships = await prisma.companyMember.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      company: true,
      user: true
    }
  });

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col px-6 py-8">
      <h1 className="text-3xl font-semibold text-gray-950">Usuarios</h1>
      <section className="mt-8 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="grid grid-cols-[1fr_1.5fr_1.3fr_1fr_1fr] gap-4 border-b border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700">
          <span>Nome</span>
          <span>Email</span>
          <span>Empresa</span>
          <span>Perfil</span>
          <span>Criado em</span>
        </div>
        {memberships.map((membership) => (
          <div
            className="grid grid-cols-[1fr_1.5fr_1.3fr_1fr_1fr] gap-4 border-b border-gray-100 px-5 py-4 text-sm text-gray-700 last:border-b-0"
            key={membership.id}
          >
            <span className="font-medium text-gray-950">
              {membership.user.name ?? "-"}
            </span>
            <span>{membership.user.email}</span>
            <span>{membership.company.name}</span>
            <span>{membership.role}</span>
            <span>{formatDate(membership.user.createdAt)}</span>
          </div>
        ))}
      </section>
    </main>
  );
}
