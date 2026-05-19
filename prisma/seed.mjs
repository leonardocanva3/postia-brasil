import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

await prisma.plan.upsert({
  where: { name: "Free" },
  update: {
    description: "Plano inicial para validar o fluxo de conteudo.",
    monthlyPrice: "0",
    monthlyPostLimit: 5,
    monthlyCaptionLimit: 5,
    monthlyCalendarLimit: 1,
    isActive: true
  },
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

await prisma.plan.upsert({
  where: { name: "Pro" },
  update: {
    description: "Plano profissional com geracoes ilimitadas.",
    monthlyPrice: "49.90",
    monthlyPostLimit: null,
    monthlyCaptionLimit: null,
    monthlyCalendarLimit: null,
    isActive: true
  },
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

await prisma.$disconnect();
