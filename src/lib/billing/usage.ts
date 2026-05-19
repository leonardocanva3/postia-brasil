import { prisma } from "@/lib/database/prisma";

export type UsageFeature = "posts" | "captions" | "calendars";

type LimitSnapshot = Readonly<{
  used: number;
  limit: number | null;
  remaining: number | null;
}>;

export type BillingUsageSnapshot = Readonly<{
  planName: string;
  subscriptionStatus: string;
  posts: LimitSnapshot;
  captions: LimitSnapshot;
  calendars: LimitSnapshot;
}>;

function getMonthRange(referenceDate = new Date()) {
  const start = new Date(
    Date.UTC(referenceDate.getUTCFullYear(), referenceDate.getUTCMonth(), 1)
  );
  const end = new Date(
    Date.UTC(referenceDate.getUTCFullYear(), referenceDate.getUTCMonth() + 1, 1)
  );

  return { start, end };
}

function toLimitSnapshot(used: number, limit: number | null): LimitSnapshot {
  return {
    used,
    limit,
    remaining: limit === null ? null : Math.max(limit - used, 0)
  };
}

async function getFallbackFreePlan() {
  return prisma.plan.upsert({
    where: { name: "Free" },
    update: {},
    create: {
      name: "Free",
      description: "Plano inicial para validar o fluxo de conteudo.",
      monthlyPrice: "0",
      monthlyPostLimit: 5,
      monthlyCaptionLimit: 5,
      monthlyCalendarLimit: 1,
      isActive: true
    }
  });
}

export async function ensureActiveSubscription(companyId: string) {
  const existingSubscription = await prisma.subscription.findFirst({
    where: {
      companyId,
      status: "ACTIVE"
    },
    orderBy: {
      createdAt: "desc"
    },
    include: {
      plan: true
    }
  });

  if (existingSubscription) {
    return existingSubscription;
  }

  const freePlan = await getFallbackFreePlan();

  return prisma.subscription.create({
    data: {
      companyId,
      planId: freePlan.id,
      status: "ACTIVE"
    },
    include: {
      plan: true
    }
  });
}

export async function getBillingUsage(companyId: string): Promise<BillingUsageSnapshot> {
  const subscription = await ensureActiveSubscription(companyId);
  const { start, end } = getMonthRange();
  const [postsUsed, captionsUsed, calendarItemsCreated] = await Promise.all([
    prisma.generatedPost.count({
      where: {
        companyId,
        createdAt: {
          gte: start,
          lt: end
        }
      }
    }),
    prisma.generatedCaption.count({
      where: {
        companyId,
        createdAt: {
          gte: start,
          lt: end
        }
      }
    }),
    prisma.editorialCalendarItem.count({
      where: {
        companyId,
        createdAt: {
          gte: start,
          lt: end
        }
      }
    })
  ]);

  const calendarsUsed = calendarItemsCreated > 0 ? 1 : 0;

  return {
    planName: subscription.plan.name,
    subscriptionStatus: subscription.status,
    posts: toLimitSnapshot(postsUsed, subscription.plan.monthlyPostLimit),
    captions: toLimitSnapshot(captionsUsed, subscription.plan.monthlyCaptionLimit),
    calendars: toLimitSnapshot(
      calendarsUsed,
      subscription.plan.monthlyCalendarLimit
    )
  };
}

export async function hasFeatureLimitAvailable(
  companyId: string,
  feature: UsageFeature,
  requestedAmount = 1
) {
  const usage = await getBillingUsage(companyId);
  const snapshot = usage[feature];

  return snapshot.limit === null || snapshot.used + requestedAmount <= snapshot.limit;
}

export async function getCurrentCompanyIdForUser(userId: string) {
  const membership = await prisma.companyMember.findFirst({
    where: {
      userId
    },
    orderBy: {
      createdAt: "asc"
    },
    select: {
      companyId: true,
      userId: true
    }
  });

  return membership;
}
