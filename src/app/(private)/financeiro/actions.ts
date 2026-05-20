"use server";

import { redirect } from "next/navigation";
import { auth } from "../../../../auth";
import { getCurrentCompanyIdForUser } from "@/lib/billing/usage";
import { prisma } from "@/lib/database/prisma";
import { createPicPayPaymentLink } from "@/lib/picpay";

export async function subscribeToProAction() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const membership = await getCurrentCompanyIdForUser(session.user.id);

  if (!membership) {
    redirect("/cadastro");
  }

  const proPlan = await prisma.plan.upsert({
    where: { name: "Pro" },
    update: {},
    create: {
      name: "Pro",
      description: "Plano profissional para operacao comercial.",
      monthlyPrice: "49.90",
      monthlyPostLimit: 30,
      monthlyCaptionLimit: 30,
      monthlyCalendarLimit: 5,
      monthlyArtLimit: 15,
      monthlyAnalysisLimit: 5,
      monthlyCampaignLimit: 3,
      isActive: true
    }
  });
  const existingSubscription = await prisma.subscription.findFirst({
    where: {
      companyId: membership.companyId,
      OR: [
        { status: "PENDING" },
        {
          status: "ACTIVE",
          plan: {
            is: {
              name: "Pro"
            }
          }
        }
      ]
    },
    orderBy: { createdAt: "desc" },
    include: {
      payments: {
        where: { status: "PENDING" },
        orderBy: { createdAt: "desc" },
        take: 1
      }
    }
  });

  if (existingSubscription?.payments[0]) {
    const payment = existingSubscription.payments[0];
    const paymentUrl = createPicPayPaymentLink({
      externalReference: payment.externalReference,
      amount: Number(payment.amount),
      description: `Assinatura ${proPlan.name} - PostIA Brasil`
    });

    redirect(paymentUrl);
  }

  if (existingSubscription) {
    redirect("/financeiro?subscription=exists");
  }

  const subscription = await prisma.subscription.create({
    data: {
      companyId: membership.companyId,
      planId: proPlan.id,
      status: "PENDING"
    }
  });
  const payment = await prisma.payment.create({
    data: {
      companyId: membership.companyId,
      subscriptionId: subscription.id,
      amount: proPlan.monthlyPrice,
      paymentMethod: "PICPAY",
      externalReference: `picpay-${subscription.id}`
    }
  });
  const paymentUrl = createPicPayPaymentLink({
    externalReference: payment.externalReference,
    amount: Number(payment.amount),
    description: `Assinatura ${proPlan.name} - PostIA Brasil`
  });

  redirect(paymentUrl);
}
