"use server";

import { redirect } from "next/navigation";
import { CompanyImageType } from "@prisma/client";
import { auth } from "../../../../auth";
import {
  getCurrentCompanyIdForUser,
  hasFeatureLimitAvailable
} from "@/lib/billing/usage";
import { resolveBusinessSegmentAndSpecialty } from "@/lib/business/segment-matcher";
import { fetchDigitalPresenceFromWebsite } from "@/lib/company/digital-presence-fetcher";
import { prisma } from "@/lib/database/prisma";
import { analyzeCompanyPresenceWithOpenAI } from "@/lib/openai/company-profile-analyzer";
import { analyzeDigitalPresenceWithOpenAI } from "@/lib/openai/digital-presence-analyzer";
import { OPENAI_MISSING_KEY_MESSAGE } from "@/lib/openai/settings";
import { saveCompanyImageUpload } from "@/lib/uploads/image-upload";

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

function readOptionalFile(formData: FormData, field: string) {
  const value = formData.get(field);

  if (!(value instanceof File) || value.size === 0) {
    return null;
  }

  return value;
}

async function readUploadedImageOrUrl(
  formData: FormData,
  companyId: string,
  fileField: string,
  urlField: string,
  requiredError = "image-invalid"
) {
  const file = readOptionalFile(formData, fileField);

  if (file) {
    try {
      return await saveCompanyImageUpload(companyId, file);
    } catch {
      redirect(`/perfil?error=${requiredError}`);
    }
  }

  const url = readOptionalField(formData, urlField);

  if (!url) {
    redirect(`/perfil?error=${requiredError}`);
  }

  return url;
}

function readTags(formData: FormData) {
  return String(formData.get("tags") ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

async function readBusinessSelection(formData: FormData) {
  const businessSegmentId = readOptionalField(formData, "businessSegmentId");
  const businessSpecialtyId = readOptionalField(formData, "businessSpecialtyId");

  if (!businessSegmentId && !businessSpecialtyId) {
    return {
      businessSegmentId: null,
      businessSpecialtyId: null
    };
  }

  const segment = businessSegmentId
    ? await prisma.businessSegment.findFirst({
        where: {
          id: businessSegmentId,
          isActive: true
        },
        select: { id: true }
      })
    : null;
  const specialty = businessSpecialtyId
    ? await prisma.businessSpecialty.findFirst({
        where: {
          id: businessSpecialtyId,
          isActive: true,
          ...(businessSegmentId ? { segmentId: businessSegmentId } : {})
        },
        select: {
          id: true,
          segmentId: true
        }
      })
    : null;

  if ((businessSegmentId && !segment) || (businessSpecialtyId && !specialty)) {
    redirect("/perfil?error=invalid");
  }

  return {
    businessSegmentId: segment?.id ?? specialty?.segmentId ?? null,
    businessSpecialtyId: specialty?.id ?? null
  };
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
  const businessSelection = await readBusinessSelection(formData);
  const logoFile = readOptionalFile(formData, "logoFile");
  let logoUrl = readOptionalField(formData, "logoUrl");

  if (logoFile) {
    try {
      logoUrl = await saveCompanyImageUpload(companyId, logoFile);
    } catch {
      redirect("/perfil?error=upload-invalid");
    }
  }

  await prisma.company.update({
    where: { id: companyId },
    data: {
      ...businessSelection,
      website: readOptionalField(formData, "website"),
      instagram: readOptionalField(formData, "instagram"),
      description: readOptionalField(formData, "description"),
      services: readOptionalField(formData, "services"),
      differentiators: readOptionalField(formData, "differentiators"),
      targetAudience: readOptionalField(formData, "targetAudience"),
      recommendedTone: readOptionalField(formData, "recommendedTone"),
      defaultCta: readOptionalField(formData, "defaultCta"),
      brandColors,
      logoUrl,
      postIdeas,
      designNotes: readOptionalField(formData, "designNotes"),
      collectedInfo: readOptionalField(formData, "collectedInfo")
    }
  });

  redirect("/perfil?saved=true");
}

export async function analyzeCompanyPresenceAction(formData: FormData) {
  const { companyId, userId } = await getCurrentCompanyContext();
  const canAnalyze = await hasFeatureLimitAvailable(companyId, "analyses");

  if (!canAnalyze) {
    redirect("/perfil?error=limit");
  }

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
  } catch (error) {
    if (error instanceof Error && error.message === OPENAI_MISSING_KEY_MESSAGE) {
      redirect("/perfil?error=openai-key");
    }

    redirect("/perfil?error=openai");
  }

  const businessSelection = await resolveBusinessSegmentAndSpecialty({
    businessSegment: analysis.businessSegment,
    businessSpecialty: analysis.businessSpecialty
  });

  await prisma.company.update({
    where: { id: companyId },
    data: {
      ...(businessSelection.businessSegmentId
        ? { businessSegmentId: businessSelection.businessSegmentId }
        : {}),
      ...(businessSelection.businessSpecialtyId
        ? { businessSpecialtyId: businessSelection.businessSpecialtyId }
        : {}),
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
  await prisma.adminLog.create({
    data: {
      userId,
      action: "COMPANY_ANALYSIS",
      entity: "Company",
      entityId: companyId,
      metadata: { mode: "manual" }
    }
  });

  redirect("/perfil?analyzed=true");
}

export async function analyzeDigitalPresenceAutomatically(formData: FormData) {
  const { companyId, userId } = await getCurrentCompanyContext();
  const canAnalyze = await hasFeatureLimitAvailable(companyId, "analyses");

  if (!canAnalyze) {
    redirect("/perfil?error=limit");
  }

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
  } catch (error) {
    if (error instanceof Error && error.message === OPENAI_MISSING_KEY_MESSAGE) {
      redirect("/perfil?error=openai-key");
    }

    redirect("/perfil?error=openai");
  }

  const businessSelection = await resolveBusinessSegmentAndSpecialty({
    businessSegment: analysis.businessSegment,
    businessSpecialty: analysis.businessSpecialty
  });

  await prisma.company.update({
    where: { id: companyId },
    data: {
      ...(businessSelection.businessSegmentId
        ? { businessSegmentId: businessSelection.businessSegmentId }
        : {}),
      ...(businessSelection.businessSpecialtyId
        ? { businessSpecialtyId: businessSelection.businessSpecialtyId }
        : {}),
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
  await prisma.adminLog.create({
    data: {
      userId,
      action: "COMPANY_ANALYSIS",
      entity: "Company",
      entityId: companyId,
      metadata: { mode: "automatic", website: fetchedPresence.url }
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

  const imageUrl = await readUploadedImageOrUrl(
    formData,
    companyId,
    "imageFile",
    "imageUrl"
  );

  await prisma.companyImage.create({
    data: {
      companyId,
      title: readRequiredField(formData, "title"),
      type: readImageType(formData),
      description: readOptionalField(formData, "description"),
      tags: readTags(formData),
      imageUrl,
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

  const imageUrl = await readUploadedImageOrUrl(
    formData,
    companyId,
    "imageFile",
    "imageUrl"
  );

  await prisma.companyImage.updateMany({
    where: { id: imageId, companyId },
    data: {
      title: readRequiredField(formData, "title"),
      type: readImageType(formData),
      description: readOptionalField(formData, "description"),
      tags: readTags(formData),
      imageUrl,
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
