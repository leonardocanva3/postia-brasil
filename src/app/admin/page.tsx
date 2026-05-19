import { prisma } from "@/lib/database/prisma";
import { formatCurrency } from "@/lib/admin/format";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [
    companiesCount,
    usersCount,
    activeSubscriptionsCount,
    postsCount,
    captionsCount,
    calendarsCount,
    activeSubscriptions
  ] = await Promise.all([
    prisma.company.count(),
    prisma.user.count(),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.generatedPost.count(),
    prisma.generatedCaption.count(),
    prisma.editorialCalendarItem.count(),
    prisma.subscription.findMany({
      where: { status: "ACTIVE" },
      include: { plan: true }
    })
  ]);
  const estimatedMonthlyRevenue = activeSubscriptions.reduce(
    (total, subscription) => total + Number(subscription.plan.monthlyPrice),
    0
  );
  const cards = [
    { label: "Total de empresas", value: String(companiesCount) },
    { label: "Total de usuarios", value: String(usersCount) },
    { label: "Assinaturas ativas", value: String(activeSubscriptionsCount) },
    {
      label: "Receita estimada mensal",
      value: formatCurrency(estimatedMonthlyRevenue)
    },
    { label: "Posts gerados", value: String(postsCount) },
    { label: "Legendas geradas", value: String(captionsCount) },
    { label: "Calendarios criados", value: String(calendarsCount) }
  ];

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col px-6 py-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
          Admin
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-gray-950">
          Visao Geral
        </h1>
        <p className="mt-3 text-gray-700">
          Indicadores operacionais da plataforma PostIA Brasil.
        </p>
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article
            className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
            key={card.label}
          >
            <p className="text-sm font-medium text-gray-600">{card.label}</p>
            <p className="mt-4 text-3xl font-semibold text-gray-950">
              {card.value}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}
