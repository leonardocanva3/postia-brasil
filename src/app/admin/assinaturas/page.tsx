import { formatDate } from "@/lib/admin/format";
import { prisma } from "@/lib/database/prisma";

export const dynamic = "force-dynamic";

export default async function AdminAssinaturasPage() {
  const subscriptions = await prisma.subscription.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      company: true,
      plan: true
    }
  });

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col px-6 py-8">
      <h1 className="text-3xl font-semibold text-gray-950">Assinaturas</h1>
      <section className="mt-8 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr] gap-4 border-b border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700">
          <span>Empresa</span>
          <span>Plano</span>
          <span>Status</span>
          <span>Inicio</span>
          <span>Fim</span>
        </div>
        {subscriptions.map((subscription) => (
          <div
            className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr] gap-4 border-b border-gray-100 px-5 py-4 text-sm text-gray-700 last:border-b-0"
            key={subscription.id}
          >
            <span className="font-medium text-gray-950">
              {subscription.company.name}
            </span>
            <span>{subscription.plan.name}</span>
            <span>{subscription.status}</span>
            <span>{formatDate(subscription.startDate)}</span>
            <span>{formatDate(subscription.endDate)}</span>
          </div>
        ))}
      </section>
    </main>
  );
}
