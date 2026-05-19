import { formatDate } from "@/lib/admin/format";
import { prisma } from "@/lib/database/prisma";

export const dynamic = "force-dynamic";

export default async function AdminEmpresasPage() {
  const companies = await prisma.company.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      members: {
        where: { role: "OWNER" },
        take: 1,
        include: { user: true }
      },
      subscriptions: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { plan: true }
      }
    }
  });

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col px-6 py-8">
      <h1 className="text-3xl font-semibold text-gray-950">Empresas</h1>
      <section className="mt-8 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="grid grid-cols-[1.4fr_1.5fr_1fr_1fr_1fr] gap-4 border-b border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700">
          <span>Empresa</span>
          <span>Responsavel</span>
          <span>Plano</span>
          <span>Status</span>
          <span>Criada em</span>
        </div>
        {companies.map((company) => {
          const owner = company.members[0]?.user;
          const subscription = company.subscriptions[0];

          return (
            <div
              className="grid grid-cols-[1.4fr_1.5fr_1fr_1fr_1fr] gap-4 border-b border-gray-100 px-5 py-4 text-sm text-gray-700 last:border-b-0"
              key={company.id}
            >
              <span className="font-medium text-gray-950">{company.name}</span>
              <span>{owner?.email ?? "-"}</span>
              <span>{subscription?.plan.name ?? "-"}</span>
              <span>{subscription?.status ?? "-"}</span>
              <span>{formatDate(company.createdAt)}</span>
            </div>
          );
        })}
      </section>
    </main>
  );
}
