import { redirect } from "next/navigation";
import { auth } from "../../../../auth";
import {
  getBillingUsage,
  getCurrentCompanyIdForUser
} from "@/lib/billing/usage";
import { prisma } from "@/lib/database/prisma";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { StatusBadge } from "@/components/ui/status-badge";

function formatLimit(used: number, limit: number | null) {
  return limit === null ? `${used} / ilimitado` : `${used} / ${limit}`;
}

function formatRemaining(remaining: number | null) {
  return remaining === null ? "Ilimitado" : String(remaining);
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const membership = await getCurrentCompanyIdForUser(session.user.id);

  if (!membership) {
    redirect("/cadastro");
  }

  const [
    usage,
    postsCount,
    captionsCount,
    scheduledCount,
    upcomingScheduledCount,
    activeCampaignsCount,
    latestPosts,
    latestCaptions,
    upcomingSchedules
  ] = await Promise.all([
    getBillingUsage(membership.companyId),
    prisma.generatedPost.count({
      where: { companyId: membership.companyId }
    }),
    prisma.generatedCaption.count({
      where: { companyId: membership.companyId }
    }),
    prisma.scheduledPost.count({
      where: { companyId: membership.companyId }
    }),
    prisma.scheduledPost.count({
      where: {
        companyId: membership.companyId,
        status: "SCHEDULED",
        scheduledFor: {
          gte: new Date()
        }
      }
    }),
    prisma.campaign.count({
      where: {
        companyId: membership.companyId,
        status: { in: ["DRAFT", "PLANNED", "GENERATED", "SCHEDULED"] }
      }
    }),
    prisma.generatedPost.findMany({
      where: { companyId: membership.companyId },
      orderBy: { createdAt: "desc" },
      take: 3
    }),
    prisma.generatedCaption.findMany({
      where: { companyId: membership.companyId },
      orderBy: { createdAt: "desc" },
      take: 3
    }),
    prisma.scheduledPost.findMany({
      where: {
        companyId: membership.companyId,
        status: "SCHEDULED",
        scheduledFor: { gte: new Date() }
      },
      orderBy: { scheduledFor: "asc" },
      take: 3
    })
  ]);
  const metrics = [
    { label: "Posts Gerados", value: String(postsCount) },
    { label: "Legendas Geradas", value: String(captionsCount) },
    { label: "Conteudos Agendados", value: String(scheduledCount) },
    { label: "Proximos Agendamentos", value: String(upcomingScheduledCount) },
    { label: "Campanhas Ativas", value: String(activeCampaignsCount) },
    { label: "Plano Atual", value: usage.planName }
  ];
  const planUsage = [
    {
      label: "Posts no mes",
      value: formatLimit(usage.posts.used, usage.posts.limit),
      remaining: formatRemaining(usage.posts.remaining)
    },
    {
      label: "Legendas no mes",
      value: formatLimit(usage.captions.used, usage.captions.limit),
      remaining: formatRemaining(usage.captions.remaining)
    },
    {
      label: "Calendarios no mes",
      value: formatLimit(usage.calendars.used, usage.calendars.limit),
      remaining: formatRemaining(usage.calendars.remaining)
    },
    {
      label: "Artes no mes",
      value: formatLimit(usage.arts.used, usage.arts.limit),
      remaining: formatRemaining(usage.arts.remaining)
    },
    {
      label: "Campanhas no mes",
      value: formatLimit(usage.campaigns.used, usage.campaigns.limit),
      remaining: formatRemaining(usage.campaigns.remaining)
    },
    {
      label: "Analises no mes",
      value: formatLimit(usage.analyses.used, usage.analyses.limit),
      remaining: formatRemaining(usage.analyses.remaining)
    }
  ];

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col px-6 py-8">
      <PageHeader
        description="Acompanhe conteudos, agendamentos e limites do seu plano em um so lugar."
        eyebrow="Visao geral"
        title="Dashboard"
      />

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <article
            className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
            key={metric.label}
          >
            <p className="text-sm font-medium text-gray-600">{metric.label}</p>
            <p className="mt-4 text-3xl font-semibold text-gray-950">
              {metric.value}
            </p>
          </article>
        ))}
      </section>

      <SectionCard
        className="mt-8"
        description="Limites e saldo restante do ciclo mensal atual."
        title="Uso do plano"
      >
        <div className="mt-5 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          {planUsage.map((item) => (
            <article className="rounded-md border border-gray-200 p-4" key={item.label}>
              <p className="text-sm font-medium text-gray-600">{item.label}</p>
              <p className="mt-3 text-2xl font-semibold text-gray-950">
                {item.value}
              </p>
              <p className="mt-2 text-sm text-gray-600">
                Restante: {item.remaining}
              </p>
            </article>
          ))}
        </div>
      </SectionCard>

      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        <SectionCard title="Ultimos posts">
          <div className="space-y-3">
            {latestPosts.length > 0 ? (
              latestPosts.map((post) => (
                <article className="rounded-md border border-gray-200 p-3" key={post.id}>
                  <p className="font-medium text-gray-950">{post.title}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                    {post.content}
                  </p>
                </article>
              ))
            ) : (
              <EmptyState
                description="Use o gerador de posts para criar seu primeiro conteudo."
                title="Nenhum post gerado"
              />
            )}
          </div>
        </SectionCard>

        <SectionCard title="Ultimas legendas">
          <div className="space-y-3">
            {latestCaptions.length > 0 ? (
              latestCaptions.map((caption) => (
                <article className="rounded-md border border-gray-200 p-3" key={caption.id}>
                  <p className="font-medium text-gray-950">{caption.subject}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                    {caption.caption}
                  </p>
                </article>
              ))
            ) : (
              <EmptyState
                description="Gere legendas para acelerar sua producao diaria."
                title="Nenhuma legenda gerada"
              />
            )}
          </div>
        </SectionCard>

        <SectionCard title="Proximos agendamentos">
          <div className="space-y-3">
            {upcomingSchedules.length > 0 ? (
              upcomingSchedules.map((schedule) => (
                <article className="rounded-md border border-gray-200 p-3" key={schedule.id}>
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium text-gray-950">{schedule.title}</p>
                    <StatusBadge status={schedule.status} />
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{schedule.platform}</p>
                </article>
              ))
            ) : (
              <EmptyState
                description="Crie agendamentos para organizar a rotina de publicacao."
                title="Nenhum agendamento futuro"
              />
            )}
          </div>
        </SectionCard>
      </section>
    </main>
  );
}
