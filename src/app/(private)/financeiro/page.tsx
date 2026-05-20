import { redirect } from "next/navigation";
import { auth } from "../../../../auth";
import {
  getBillingUsage,
  getCurrentCompanyIdForUser
} from "@/lib/billing/usage";
import { prisma } from "@/lib/database/prisma";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingButton } from "@/components/ui/loading-button";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { subscribeToProAction } from "./actions";

type FinanceiroPageProps = Readonly<{
  searchParams: Promise<{
    subscription?: string;
  }>;
}>;

function formatLimit(used: number, limit: number | null) {
  return limit === null ? `${used} / ilimitado` : `${used} / ${limit}`;
}

function formatPlanLimit(limit: number | null | undefined) {
  return limit === null || limit === undefined ? "Ilimitado" : String(limit);
}

function formatCurrency(value: unknown) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(Number(value));
}

export default async function FinanceiroPage({ searchParams }: FinanceiroPageProps) {
  const params = await searchParams;
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const membership = await getCurrentCompanyIdForUser(session.user.id);

  if (!membership) {
    redirect("/cadastro");
  }

  const [usage, plans, pendingPayments] = await Promise.all([
    getBillingUsage(membership.companyId),
    prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { monthlyPrice: "asc" }
    }),
    prisma.payment.findMany({
      where: {
        companyId: membership.companyId
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 5
    })
  ]);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8">
      <PageHeader
        description="Acompanhe seu plano atual, limites mensais e pagamentos preparados para PicPay."
        eyebrow="Financeiro"
        title="Plano e assinatura"
      />

      {params.subscription === "exists" ? (
        <div className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Ja existe uma assinatura ativa ou pendente para esta empresa. Evitamos
          criar uma nova cobrança duplicada.
        </div>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <article className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-600">Plano atual</p>
          <p className="mt-4 text-3xl font-semibold text-gray-950">
            {usage.planName}
          </p>
        </article>
        <article className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-600">Status</p>
          <div className="mt-5">
            <StatusBadge status={usage.subscriptionStatus} />
          </div>
          {usage.subscriptionStatus === "PENDING" ? (
            <p className="mt-3 text-sm text-amber-700">
              Sua assinatura esta pendente. Conclua o pagamento para liberar o
              plano escolhido.
            </p>
          ) : null}
        </article>
        <article className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-600">Posts</p>
          <p className="mt-4 text-3xl font-semibold text-gray-950">
            {formatLimit(usage.posts.used, usage.posts.limit)}
          </p>
        </article>
        <article className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-600">Legendas</p>
          <p className="mt-4 text-3xl font-semibold text-gray-950">
            {formatLimit(usage.captions.used, usage.captions.limit)}
          </p>
        </article>
        <article className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-600">Artes</p>
          <p className="mt-4 text-3xl font-semibold text-gray-950">
            {formatLimit(usage.arts.used, usage.arts.limit)}
          </p>
        </article>
        <article className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-600">Campanhas</p>
          <p className="mt-4 text-3xl font-semibold text-gray-950">
            {formatLimit(usage.campaigns.used, usage.campaigns.limit)}
          </p>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <SectionCard title="Planos disponiveis">
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {plans.map((plan) => (
              <article className="rounded-md border border-gray-200 p-4" key={plan.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-950">{plan.name}</h3>
                    <p className="mt-2 text-sm leading-6 text-gray-600">
                      {plan.description}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-gray-950">
                    {formatCurrency(plan.monthlyPrice)}
                  </p>
                </div>
                <dl className="mt-4 space-y-2 text-sm text-gray-700">
                  <div className="flex justify-between gap-4">
                    <dt>Posts</dt>
                    <dd>{plan.monthlyPostLimit ?? "Ilimitado"}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>Legendas</dt>
                    <dd>{plan.monthlyCaptionLimit ?? "Ilimitado"}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>Calendarios</dt>
                    <dd>{formatPlanLimit(plan.monthlyCalendarLimit)}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>Artes</dt>
                    <dd>{formatPlanLimit(plan.monthlyArtLimit)}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>Analises</dt>
                    <dd>{formatPlanLimit(plan.monthlyAnalysisLimit)}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>Campanhas</dt>
                    <dd>{formatPlanLimit(plan.monthlyCampaignLimit)}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Assinar Pro">
          <p className="mt-3 text-sm leading-6 text-gray-600">
            Gera uma referencia de pagamento preparada para PicPay. A ativacao
            automatica via webhook fica para a proxima etapa.
          </p>
          <form action={subscribeToProAction}>
            <LoadingButton className="mt-5 w-full" loadingText="Criando pagamento...">
              Assinar
            </LoadingButton>
          </form>

          <h3 className="mt-8 text-sm font-semibold text-gray-950">
            Ultimos pagamentos
          </h3>
          <div className="mt-3 space-y-3">
            {pendingPayments.length > 0 ? (
              pendingPayments.map((payment) => (
                <div
                  className="rounded-md border border-gray-200 p-3 text-sm"
                  key={payment.id}
                >
                  <p className="font-medium text-gray-950">
                    {formatCurrency(payment.amount)}
                  </p>
                  <div className="mt-2">
                    <StatusBadge status={payment.status} />
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                description="Quando uma assinatura for iniciada, o pagamento aparecera aqui."
                title="Nenhum pagamento criado"
              />
            )}
          </div>
        </SectionCard>
      </section>

      <SectionCard
        description="Comparativo comercial dos limites mensais para demonstracao e venda."
        title="Free vs Pro"
      >
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-600">
                <th className="py-3 pr-4 font-semibold">Recurso</th>
                <th className="py-3 pr-4 font-semibold">Free</th>
                <th className="py-3 pr-4 font-semibold">Pro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {[
                ["Posts", "5", "30"],
                ["Legendas", "5", "30"],
                ["Calendarios", "1", "5"],
                ["Artes", "1", "15"],
                ["Analises de empresa", "1", "5"],
                ["Campanhas", "0", "3"]
              ].map(([feature, free, pro]) => (
                <tr key={feature}>
                  <td className="py-3 pr-4 font-medium text-gray-950">{feature}</td>
                  <td className="py-3 pr-4">{free}</td>
                  <td className="py-3 pr-4">{pro}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </main>
  );
}
