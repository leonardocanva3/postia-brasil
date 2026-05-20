"use server";

import { ArtFormat } from "@prisma/client";
import { redirect } from "next/navigation";
import { auth } from "../../../../auth";
import { buildArtBriefDraft, buildGeneratedArtFormatData } from "@/lib/art";
import { getCurrentCompanyIdForUser } from "@/lib/billing/usage";
import { getCompanyProfileContext } from "@/lib/company/profile-context";
import { prisma } from "@/lib/database/prisma";
import { generateArtPngFromDraft } from "@/lib/openai/art-generator";
import { buildArtworkPrompt } from "@/lib/openai/artwork-generator";

function readRequiredField(formData: FormData, field: string) {
  const value = String(formData.get(field) ?? "").trim();

  if (!value) {
    redirect("/artes?error=invalid");
  }

  return value;
}

function readArtFormat(formData: FormData) {
  const format = readRequiredField(formData, "format");

  if (!Object.values(ArtFormat).includes(format as ArtFormat)) {
    redirect("/artes?error=invalid");
  }

  return format as ArtFormat;
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

async function getSelectedImage(companyId: string, imageId: string | null) {
  if (!imageId) {
    return null;
  }

  return prisma.companyImage.findFirst({
    where: {
      id: imageId,
      companyId,
      isActive: true
    },
    select: {
      id: true,
      title: true,
      type: true,
      description: true,
      tags: true,
      imageUrl: true
    }
  });
}

export async function prepareArtworkDraftAction(formData: FormData) {
  const { companyId, userId } = await getCurrentCompanyContext();
  const format = readArtFormat(formData);
  const subject = readRequiredField(formData, "subject");
  const objective = readRequiredField(formData, "objective");
  const platform = readRequiredField(formData, "platform");
  const companyImageId = String(formData.get("companyImageId") ?? "").trim() || null;
  const useLogo = formData.get("useLogo") === "on";
  const useBrandColors = formData.get("useBrandColors") === "on";
  const [companyProfile, selectedImage] = await Promise.all([
    getCompanyProfileContext(companyId),
    getSelectedImage(companyId, companyImageId)
  ]);

  if (companyImageId && !selectedImage) {
    redirect("/artes?error=invalid");
  }

  const formatData = buildArtBriefDraft({
    subject,
    objective,
    platform,
    format,
    companyImageId,
    useLogo,
    useBrandColors
  });
  const prompt = buildArtworkPrompt({
    subject,
    objective,
    platform,
    format,
    companyProfile,
    selectedImage
  });

  await prisma.generatedArt.create({
    data: {
      companyId,
      userId,
      companyImageId,
      subject,
      objective,
      platform,
      title: subject,
      format: formatData.format,
      width: formatData.width,
      height: formatData.height,
      aspectRatio: formatData.aspectRatio,
      useLogo,
      useBrandColors,
      outputMimeType: "image/png",
      quality: "high",
      prompt,
      templateMetadata: formatData.templateMetadata,
      status: "DRAFT"
    }
  });

  redirect("/artes?draft=true");
}

export async function duplicateArtworkDraftAction(formData: FormData) {
  const { companyId, userId } = await getCurrentCompanyContext();
  const artworkId = readRequiredField(formData, "artworkId");
  const artwork = await prisma.generatedArt.findFirst({
    where: {
      id: artworkId,
      companyId
    }
  });

  if (!artwork) {
    redirect("/artes?error=invalid");
  }

  await prisma.generatedArt.create({
    data: {
      companyId,
      userId,
      generatedPostId: artwork.generatedPostId,
      generatedCaptionId: artwork.generatedCaptionId,
      scheduledPostId: artwork.scheduledPostId,
      companyImageId: artwork.companyImageId,
      subject: artwork.subject,
      objective: artwork.objective,
      platform: artwork.platform,
      format: artwork.format,
      width: artwork.width,
      height: artwork.height,
      aspectRatio: artwork.aspectRatio,
      title: `${artwork.title} (copia)`,
      useLogo: artwork.useLogo,
      useBrandColors: artwork.useBrandColors,
      outputMimeType: artwork.outputMimeType,
      quality: artwork.quality,
      prompt: artwork.prompt,
      imageUrl: artwork.imageUrl,
      ...(artwork.templateMetadata
        ? { templateMetadata: artwork.templateMetadata }
        : {}),
      status: "DRAFT"
    }
  });

  redirect("/artes?duplicated=true");
}

export async function generateArtFromDraft(formData: FormData) {
  const { companyId } = await getCurrentCompanyContext();
  const artworkId = readRequiredField(formData, "artworkId");
  const artwork = await prisma.generatedArt.findFirst({
    where: {
      id: artworkId,
      companyId
    },
    include: {
      companyImage: {
        select: {
          id: true,
          companyId: true,
          title: true,
          type: true,
          description: true,
          tags: true,
          imageUrl: true,
          isActive: true
        }
      }
    }
  });

  if (!artwork) {
    redirect("/artes?error=invalid");
  }

  if (artwork.status !== "DRAFT") {
    redirect("/artes?error=not-draft");
  }

  const formatData = buildGeneratedArtFormatData(artwork.format);
  const hasValidFormat =
    artwork.width === formatData.width &&
    artwork.height === formatData.height &&
    artwork.aspectRatio === formatData.aspectRatio;

  if (!hasValidFormat) {
    redirect("/artes?error=invalid");
  }

  if (
    artwork.companyImageId &&
    (!artwork.companyImage ||
      artwork.companyImage.companyId !== companyId ||
      !artwork.companyImage.isActive)
  ) {
    redirect("/artes?error=invalid");
  }

  try {
    const companyProfile = await getCompanyProfileContext(companyId);
    const generated = await generateArtPngFromDraft({
      subject: artwork.subject,
      objective: artwork.objective,
      platform: artwork.platform,
      format: artwork.format,
      companyImageId: artwork.companyImageId,
      useLogo: artwork.useLogo,
      useBrandColors: artwork.useBrandColors,
      companyProfile,
      selectedImage: artwork.companyImage
    });

    await prisma.generatedArt.updateMany({
      where: {
        id: artwork.id,
        companyId
      },
      data: {
        prompt: generated.prompt,
        imageUrl: generated.imageUrl,
        status: "GENERATED"
      }
    });
  } catch {
    await prisma.generatedArt.updateMany({
      where: {
        id: artwork.id,
        companyId
      },
      data: {
        status: "FAILED"
      }
    });

    redirect("/artes?error=generate");
  }

  redirect("/artes?generated=true");
}

export async function deleteArtworkDraftAction(formData: FormData) {
  const { companyId } = await getCurrentCompanyContext();
  const artworkId = readRequiredField(formData, "artworkId");

  await prisma.generatedArt.deleteMany({
    where: {
      id: artworkId,
      companyId
    }
  });

  redirect("/artes?deleted=true");
}
