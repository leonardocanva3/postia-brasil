"use server";

import { EditorialCalendarStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "../../../../auth";
import {
  getCurrentCompanyIdForUser,
  hasFeatureLimitAvailable
} from "@/lib/billing/usage";
import { getCompanyProfileContext } from "@/lib/company/profile-context";
import { prisma } from "@/lib/database/prisma";
import { generateEditorialCalendarWithOpenAI } from "@/lib/openai/editorial-calendar-generator";

function readRequiredField(formData: FormData, field: string) {
  const value = String(formData.get(field) ?? "").trim();

  if (!value) {
    redirect("/calendario?error=invalid");
  }

  return value;
}

function readIdeasCount(formData: FormData) {
  const value = Number(formData.get("ideasCount"));

  if (!Number.isInteger(value) || value < 1 || value > 31) {
    redirect("/calendario?error=invalid");
  }

  return value;
}

function readPlatforms(formData: FormData) {
  const platforms = formData
    .getAll("platforms")
    .map(String)
    .map((platform) => platform.trim())
    .filter(Boolean);

  if (platforms.length === 0) {
    redirect("/calendario?error=invalid");
  }

  return platforms;
}

function parseSuggestedDate(value: string) {
  const date = new Date(`${value}T12:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Data sugerida invalida.");
  }

  return date;
}

async function getCurrentCompanyContext() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const membership = await getCurrentCompanyIdForUser(session.user.id);

  if (!membership) {
    redirect("/cadastro");
  }

  return membership;
}

export async function generateEditorialCalendarAction(formData: FormData) {
  const { companyId, userId } = await getCurrentCompanyContext();
  const input = {
    businessType: readRequiredField(formData, "businessType"),
    referenceMonth: readRequiredField(formData, "referenceMonth"),
    ideasCount: readIdeasCount(formData),
    platforms: readPlatforms(formData),
    tone: readRequiredField(formData, "tone"),
    companyProfile: await getCompanyProfileContext(companyId)
  };
  const canGenerateCalendar = await hasFeatureLimitAvailable(
    companyId,
    "calendars",
    1
  );

  if (!canGenerateCalendar) {
    redirect("/calendario?error=limit");
  }

  let generatedCalendar;

  try {
    generatedCalendar = await generateEditorialCalendarWithOpenAI(input);
  } catch {
    redirect("/calendario?error=openai");
  }

  await prisma.editorialCalendarItem.createMany({
    data: generatedCalendar.items.map((item) => ({
      companyId,
      userId,
      title: item.title,
      description: item.description,
      platform: item.platform,
      contentType: item.contentType,
      objective: item.objective,
      suggestedDate: parseSuggestedDate(item.suggestedDate)
    }))
  });

  redirect("/calendario?saved=true");
}

export async function updateEditorialCalendarItemStatusAction(formData: FormData) {
  const { companyId } = await getCurrentCompanyContext();
  const itemId = readRequiredField(formData, "itemId");
  const status = readRequiredField(formData, "status");

  if (!Object.values(EditorialCalendarStatus).includes(status as EditorialCalendarStatus)) {
    redirect("/calendario?error=invalid");
  }

  await prisma.editorialCalendarItem.updateMany({
    where: {
      id: itemId,
      companyId
    },
    data: {
      status: status as EditorialCalendarStatus
    }
  });

  revalidatePath("/calendario");
}

export async function deleteEditorialCalendarItemAction(formData: FormData) {
  const { companyId } = await getCurrentCompanyContext();
  const itemId = readRequiredField(formData, "itemId");

  await prisma.editorialCalendarItem.deleteMany({
    where: {
      id: itemId,
      companyId
    }
  });

  revalidatePath("/calendario");
}
