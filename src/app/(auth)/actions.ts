"use server";

import { AuthError } from "next-auth";
import { hash } from "bcryptjs";
import { redirect } from "next/navigation";
import { signIn } from "../../../auth";
import { prisma } from "@/lib/database/prisma";

function createSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export async function loginAction(formData: FormData) {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/dashboard"
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/login?error=credentials");
    }

    throw error;
  }
}

export async function registerAction(formData: FormData) {
  const companyName = String(formData.get("companyName") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  const password = String(formData.get("password") ?? "");

  if (!companyName || !name || !email || password.length < 8) {
    redirect("/cadastro?error=invalid");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    redirect("/cadastro?error=exists");
  }

  const baseSlug = createSlug(companyName) || "empresa";
  const slug = `${baseSlug}-${crypto.randomUUID().slice(0, 8)}`;
  const passwordHash = await hash(password, 12);
  const freePlan = await prisma.plan.upsert({
    where: { name: "Free" },
    update: {},
    create: {
      name: "Free",
      description: "Plano inicial para validar o fluxo de conteudo.",
      monthlyPrice: "0",
      monthlyPostLimit: 5,
      monthlyCaptionLimit: 5,
      monthlyCalendarLimit: 1,
      monthlyArtLimit: 1,
      monthlyAnalysisLimit: 1,
      monthlyCampaignLimit: 0,
      isActive: true
    }
  });

  await prisma.company.create({
    data: {
      name: companyName,
      slug,
      members: {
        create: {
          role: "OWNER",
          user: {
            create: {
              name,
              email,
              passwordHash
            }
          }
        }
      },
      subscriptions: {
        create: {
          planId: freePlan.id,
          status: "ACTIVE"
        }
      }
    }
  });

  await signIn("credentials", {
    email,
    password,
    redirectTo: "/dashboard"
  });
}
