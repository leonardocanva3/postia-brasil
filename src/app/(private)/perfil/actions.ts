"use server";

import { redirect } from "next/navigation";
import { CompanyImageType } from "@prisma/client";
import { auth } from "../../../../auth";
import { getCurrentCompanyIdForUser } from "@/lib/billing/usage";
import { fetchDigitalPresenceFromWebsite } from "@/lib/company/digital-presence-fetcher";
import { prisma } from "@/lib/database/prisma";
import { analyzeCompanyPresenceWithOpenAI } from "@/lib/openai/company-profile-analyzer";
import { analyzeDigitalPresenceWithOpenAI } from "@/lib/openai/digital-presence-analyzer";

function readOptionalField(formData: FormData, field: string) {
  const value = String(formData.get(field) ?? "").trim();

  return value || null;
}

function readRequiredField(formData: FormData, field: string) {
  const value = String(formData.get(field) ?? "").trim();

  if (!value) {
    redirect("/perfil?error=invalid");
  }

  return value;
}

function readTags(formData: FormData) {
  return String(formData.get("tags") ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function readImageType(formData: FormData) {
  const type = readRequiredField(formData, "type");

  if (!Object.values(CompanyImageType).includes(type as CompanyImageType)) {
    redirect("/perfil?error=image-invalid");
  }

  return type as CompanyImageType;
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

export async function saveCompanyProfileAction(formData: FormData) {
  const { companyId } = await getCurrentCompanyContext();
  const postIdeas = String(formData.get("postIdeas") ?? "")
    .split("\n")
    .map((idea) => idea.trim())
    .filter(Boolean);
  const brandColors = String(formData.get("brandColors") ?? "")
    .split(",")
    .map((color) => color.trim())
    .filter(Boolean);

  await prisma.company.update({
    where: { id: companyId },
    data: {
      website: readOptionalField(formData, "website"),
      instagram: readOptionalField(formData, "instagram"),
      description: readOptionalField(formData, "description"),
      services: readOptionalField(formData, "services"),
      differentiators: readOptionalField(formData, "differentiators"),
      targetAudience: readOptionalField(formData, "targetAudience"),
      recommendedTone: readOptionalField(formData, "recommendedTone"),
      defaultCta: readOptionalField(formData, "defaultCta"),
      brandColors,
      logoUrl: readOptionalField(formData, "logoUrl"),
      postIdeas,
      designNotes: readOptionalField(formData, "designNotes"),
      collectedInfo: readOptionalField(formData, "collectedInfo")
    }
  });

  redirect("/perfil?saved=true");
}

export async function analyzeCompanyPresenceAction(formData: FormData) {
  const { companyId } = await getCurrentCompanyContext();
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: {
      name: true
    }
  });

  if (!company) {
    redirect("/cadastro");
  }

  const website = readOptionalField(formData, "website");
  const instagram = readOptionalField(formData, "instagram");
  const collectedInfo = readRequiredField(formData, "collectedInfo");
  let analysis;

  try {
    analysis = await analyzeCompanyPresenceWithOpenAI({
      companyName: company.name,
      website,
      instagram,
      collectedInfo
    });
  } catch {
    redirect("/perfil?error=openai");
  }

  await prisma.company.update({
    where: { id: companyId },
    data: {
      website,
      instagram,
      collectedInfo,
      description: analysis.description,
      services: analysis.services,
      differentiators: analysis.differentiators,
      targetAudience: analysis.targetAudience,
      recommendedTone: analysis.recommendedTone,
      defaultCta: analysis.defaultCta,
      postIdeas: analysis.postIdeas,
      designNotes: analysis.designNotes
    }
  });

  redirect("/perfil?analyzed=true");
}

export async function analyzeDigitalPresenceAutomatically(formData: FormData) {
  const { companyId } = await getCurrentCompanyContext();
  const website = readRequiredField(formData, "website");
  const instagram = readOptionalField(formData, "instagram");
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: {
      name: true
    }
  });

  if (!company) {
    redirect("/cadastro");
  }

  let fetchedPresence;

  try {
    fetchedPresence = await fetchDigitalPresenceFromWebsite(website);
  } catch {
    redirect("/perfil?error=site-fetch");
  }

  let analysis;

  try {
    analysis = await analyzeDigitalPresenceWithOpenAI({
      companyName: company.name,
      website: fetchedPresence.url,
      instagram,
      websiteContext: fetchedPresence.promptText
    });
  } catch {
    redirect("/perfil?error=openai");
  }

  await prisma.company.update({
    where: { id: companyId },
    data: {
      website: fetchedPresence.url,
      instagram,
      collectedInfo: fetchedPresence.promptText,
      description: analysis.description,
      services: analysis.services,
      differentiators: analysis.differentiators,
      targetAudience: analysis.targetAudience,
      recommendedTone: analysis.recommendedTone,
      defaultCta: analysis.defaultCta,
      postIdeas: analysis.postIdeas,
      designNotes: analysis.designNotes
    }
  });

  redirect("/perfil?autoAnalyzed=true");
}

export async function createCompanyImageAction(formData: FormData) {
  const { companyId } = await getCurrentCompanyContext();
  const activeImagesCount = await prisma.companyImage.count({
    where: {
      companyId,
      isActive: true
    }
  });

  if (activeImagesCount >= 10) {
    redirect("/perfil?error=image-limit");
  }

  await prisma.companyImage.create({
    data: {
      companyId,
      title: readRequiredField(formData, "title"),
      type: readImageType(formData),
      description: readOptionalField(formData, "description"),
      tags: readTags(formData),
      imageUrl: readRequiredField(formData, "imageUrl"),
      isActive: formData.get("isActive") === "on"
    }
  });

  redirect("/perfil?imageSaved=true");
}

export async function updateCompanyImageAction(formData: FormData) {
  const { companyId } = await getCurrentCompanyContext();
  const imageId = readRequiredField(formData, "imageId");
  const shouldBeActive = formData.get("isActive") === "on";
  const currentImage = await prisma.companyImage.findFirst({
    where: { id: imageId, companyId },
    select: { isActive: true }
  });

  if (!currentImage) {
    redirect("/perfil?error=image-invalid");
  }

  if (!currentImage.isActive && shouldBeActive) {
    const activeImagesCount = await prisma.companyImage.count({
      where: { companyId, isActive: true }
    });

    if (activeImagesCount >= 10) {
      redirect("/perfil?error=image-limit");
    }
  }

  await prisma.companyImage.updateMany({
    where: { id: imageId, companyId },
    data: {
      title: readRequiredField(formData, "title"),
      type: readImageType(formData),
      description: readOptionalField(formData, "description"),
      tags: readTags(formData),
      imageUrl: readRequiredField(formData, "imageUrl"),
      isActive: shouldBeActive
    }
  });

  redirect("/perfil?imageSaved=true");
}

export async function deactivateCompanyImageAction(formData: FormData) {
  const { companyId } = await getCurrentCompanyContext();
  const imageId = readRequiredField(formData, "imageId");

  await prisma.companyImage.updateMany({
    where: { id: imageId, companyId },
    data: { isActive: false }
  });

  redirect("/perfil?imageSaved=true");
}

export async function deleteCompanyImageAction(formData: FormData) {
  const { companyId } = await getCurrentCompanyContext();
  const imageId = readRequiredField(formData, "imageId");

  await prisma.companyImage.deleteMany({
    where: { id: imageId, companyId }
  });

  redirect("/perfil?imageSaved=true");
}
