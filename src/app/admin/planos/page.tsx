import { formatCurrency, formatLimit } from "@/lib/admin/format";
import { prisma } from "@/lib/database/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPlanosPage() {
  const plans = await prisma.plan.findMany({
    orderBy: { monthlyPrice: "asc" }
  });

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col px-6 py-8">
      <h1 className="text-3xl font-semibold text-gray-950">Planos</h1>
      <section className="mt-8 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr] gap-4 border-b border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700">
          <span>Nome</span>
          <span>Preco</span>
          <span>Posts</span>
          <span>Legendas</span>
          <span>Calendarios</span>
          <span>Status</span>
        </div>
        {plans.map((plan) => (
          <div
            className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr] gap-4 border-b border-gray-100 px-5 py-4 text-sm text-gray-700 last:border-b-0"
            key={plan.id}
          >
            <span className="font-medium text-gray-950">{plan.name}</span>
            <span>{formatCurrency(plan.monthlyPrice)}</span>
            <span>{formatLimit(plan.monthlyPostLimit)}</span>
            <span>{formatLimit(plan.monthlyCaptionLimit)}</span>
            <span>{formatLimit(plan.monthlyCalendarLimit)}</span>
            <span>{plan.isActive ? "Ativo" : "Inativo"}</span>
          </div>
        ))}
      </section>
    </main>
  );
}
