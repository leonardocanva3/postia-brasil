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
      description: "Plano profissional com geracoes ilimitadas.",
      monthlyPrice: "49.90",
      monthlyPostLimit: null,
      monthlyCaptionLimit: null,
      monthlyCalendarLimit: null,
      isActive: true
    }
  });
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
