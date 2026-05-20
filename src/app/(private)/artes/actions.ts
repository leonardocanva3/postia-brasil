"use server";

import { ArtFormat, ArtStyle, DesignerLevel } from "@prisma/client";
import { redirect } from "next/navigation";
import { auth } from "../../../../auth";
import {
  buildArtBriefDraft,
  buildGeneratedArtFormatData,
  getRealArtTemplate,
  inferDesignerLevel,
  inferArtStyle,
  selectRealArtTemplate
} from "@/lib/art";
import {
  getCurrentCompanyIdForUser,
  hasFeatureLimitAvailable
} from "@/lib/billing/usage";
import { getCompanyProfileContext } from "@/lib/company/profile-context";
import { prisma } from "@/lib/database/prisma";
import { generateArtPngFromDraft } from "@/lib/openai/art-generator";
import { buildArtworkPrompt } from "@/lib/openai/artwork-generator";
import { OPENAI_MISSING_KEY_MESSAGE } from "@/lib/openai/settings";

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

function readArtStyle(formData: FormData) {
  const style = String(formData.get("style") ?? "").trim();

  if (!style) {
    return null;
  }

  if (!Object.values(ArtStyle).includes(style as ArtStyle)) {
    redirect("/artes?error=invalid");
  }

  return style as ArtStyle;
}

function readDesignerLevel(formData: FormData) {
  const level = String(formData.get("designerLevel") ?? "").trim();

  if (!level) {
    return null;
  }

  if (!Object.values(DesignerLevel).includes(level as DesignerLevel)) {
    redirect("/artes?error=invalid");
  }

  return level as DesignerLevel;
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

async function getSelectedTemplate(
  companyId: string,
  templateId: string | null,
  format: ArtFormat
) {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: {
      businessSegmentId: true,
      businessSpecialtyId: true,
      businessSegment: { select: { name: true } },
      businessSpecialty: { select: { name: true } }
    }
  });

  if (!company) {
    redirect("/cadastro");
  }

  if (!templateId) {
    return null;
  }

  return prisma.artTemplate.findFirst({
    where: {
      id: templateId,
      isActive: true,
      format,
      OR: [
        { specialtyId: company.businessSpecialtyId },
        { segmentId: company.businessSegmentId },
        { segmentId: null, specialtyId: null }
      ]
    },
    select: {
      id: true,
      name: true,
      description: true,
      visualStyle: true,
      layoutHints: true
    }
  });
}

function readTemplateSelection(formData: FormData) {
  const rawValue = String(formData.get("artTemplateId") ?? "").trim();

  if (!rawValue) {
    return {
      realTemplateId: null,
      databaseTemplateId: null
    };
  }

  if (rawValue.startsWith("real:")) {
    return {
      realTemplateId: rawValue.replace("real:", ""),
      databaseTemplateId: null
    };
  }

  return {
    realTemplateId: null,
    databaseTemplateId: rawValue.replace("db:", "")
  };
}

function getRealTemplateFromMetadata(metadata: unknown) {
  if (!metadata || typeof metadata !== "object") {
    return null;
  }

  const selected = (metadata as { selectedRealTemplate?: { id?: unknown } })
    .selectedRealTemplate;

  if (!selected || typeof selected.id !== "string") {
    return null;
  }

  return getRealArtTemplate(selected.id);
}

async function getAutoConceptualTemplate(companyId: string, format: ArtFormat) {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: {
      businessSegmentId: true,
      businessSpecialtyId: true
    }
  });

  if (!company) {
    redirect("/cadastro");
  }

  return prisma.artTemplate.findFirst({
      where: {
        isActive: true,
        format,
        OR: [
          { specialtyId: company.businessSpecialtyId },
          { segmentId: company.businessSegmentId },
          { segmentId: null, specialtyId: null }
        ]
      },
      orderBy: [{ specialtyId: "desc" }, { segmentId: "desc" }, { createdAt: "asc" }],
      select: {
        id: true,
        name: true,
        description: true,
        visualStyle: true,
        layoutHints: true
      }
    });
}

export async function prepareArtworkDraftAction(formData: FormData) {
  const { companyId, userId } = await getCurrentCompanyContext();
  const canPrepareArt = await hasFeatureLimitAvailable(companyId, "arts");

  if (!canPrepareArt) {
    redirect("/artes?error=limit");
  }

  const format = readArtFormat(formData);
  const subject = readRequiredField(formData, "subject");
  const objective = readRequiredField(formData, "objective");
  const platform = readRequiredField(formData, "platform");
  const companyImageId = String(formData.get("companyImageId") ?? "").trim() || null;
  const templateSelection = readTemplateSelection(formData);
  const requestedStyle = readArtStyle(formData);
  const requestedDesignerLevel = readDesignerLevel(formData);
  const useLogo = formData.get("useLogo") === "on";
  const useBrandColors = formData.get("useBrandColors") === "on";
  const [company, companyProfile, selectedImage, selectedTemplate] = await Promise.all([
    prisma.company.findUnique({
      where: { id: companyId },
      select: {
        businessSegment: { select: { name: true } },
        businessSpecialty: { select: { name: true } }
      }
    }),
    getCompanyProfileContext(companyId),
    getSelectedImage(companyId, companyImageId),
    getSelectedTemplate(companyId, templateSelection.databaseTemplateId, format)
  ]);

  if ((companyImageId && !selectedImage) || (templateSelection.databaseTemplateId && !selectedTemplate)) {
    redirect("/artes?error=invalid");
  }

  const style =
    requestedStyle ??
    inferArtStyle({
      segmentName: company?.businessSegment?.name,
      specialtyName: company?.businessSpecialty?.name,
      objective
    });
  const designerLevel =
    requestedDesignerLevel ??
    inferDesignerLevel({
      segmentName: company?.businessSegment?.name,
      specialtyName: company?.businessSpecialty?.name
    });
  const selectedRealTemplate = templateSelection.realTemplateId
    ? getRealArtTemplate(templateSelection.realTemplateId)
    : selectRealArtTemplate({
        segmentName: company?.businessSegment?.name,
        specialtyName: company?.businessSpecialty?.name,
        style,
        objective,
        format,
        hasImage: Boolean(selectedImage)
      });

  if (
    templateSelection.realTemplateId &&
    (!selectedRealTemplate || !selectedRealTemplate.supportedFormats.includes(format))
  ) {
    redirect("/artes?error=invalid");
  }

  const conceptualTemplate =
    selectedTemplate ??
    (templateSelection.realTemplateId
      ? null
      : await getAutoConceptualTemplate(companyId, format));

  const formatData = buildArtBriefDraft({
    subject,
    objective,
    platform,
    format,
    style,
    designerLevel,
    selectedTemplate: selectedRealTemplate,
    companyImageId,
    useLogo,
    useBrandColors
  });
  const prompt = buildArtworkPrompt({
    subject,
    objective,
    platform,
    format,
    style,
    designerLevel,
    companyProfile,
    selectedImage,
    selectedTemplate: conceptualTemplate,
    selectedRealTemplate
  });

  await prisma.generatedArt.create({
    data: {
      companyId,
      userId,
      companyImageId,
      artTemplateId: conceptualTemplate?.id ?? null,
      subject,
      objective,
      platform,
      title: subject,
      format: formatData.format,
      style,
      designerLevel,
      width: formatData.width,
      height: formatData.height,
      aspectRatio: formatData.aspectRatio,
      useLogo,
      useBrandColors,
      outputMimeType: "image/png",
      quality: "high",
      prompt,
      templateMetadata: {
        ...formatData.templateMetadata,
        selectedRealTemplate: formatData.selectedTemplate,
        layoutStructure: formatData.layoutStructure,
        logoPlacement: formatData.logoPlacement,
        imagePlacement: formatData.imagePlacement,
        titlePlacement: formatData.titlePlacement,
        subtitlePlacement: formatData.subtitlePlacement,
        ctaPlacement: formatData.ctaPlacement,
        graphicElements: formatData.graphicElements,
        compositionRules: formatData.compositionRules
      },
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
      artTemplateId: artwork.artTemplateId,
      subject: artwork.subject,
      objective: artwork.objective,
      platform: artwork.platform,
      format: artwork.format,
      style: artwork.style,
      designerLevel: artwork.designerLevel,
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
      },
      artTemplate: {
        select: {
          id: true,
          name: true,
          description: true,
          visualStyle: true,
          layoutHints: true,
          isActive: true,
          format: true
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

  if (artwork.artTemplate && (!artwork.artTemplate.isActive || artwork.artTemplate.format !== artwork.format)) {
    redirect("/artes?error=invalid");
  }

  try {
    const companyProfile = await getCompanyProfileContext(companyId);
    const selectedRealTemplate =
      getRealTemplateFromMetadata(artwork.templateMetadata) ??
      selectRealArtTemplate({
        segmentName: companyProfile?.businessSegment?.name,
        specialtyName: companyProfile?.businessSpecialty?.name,
        style: artwork.style,
        objective: artwork.objective,
        format: artwork.format,
        hasImage: Boolean(artwork.companyImage)
      });
    const generated = await generateArtPngFromDraft({
      subject: artwork.subject,
      objective: artwork.objective,
      platform: artwork.platform,
      format: artwork.format,
      style: artwork.style,
      designerLevel: artwork.designerLevel,
      companyImageId: artwork.companyImageId,
      useLogo: artwork.useLogo,
      useBrandColors: artwork.useBrandColors,
      companyProfile,
      selectedImage: artwork.companyImage,
      selectedTemplate: artwork.artTemplate,
      selectedRealTemplate
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
  } catch (error) {
    if (error instanceof Error && error.message === OPENAI_MISSING_KEY_MESSAGE) {
      redirect("/artes?error=openai-key");
    }

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
