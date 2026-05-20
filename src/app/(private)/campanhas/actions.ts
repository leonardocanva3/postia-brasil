"use server";

import { ArtFormat, ArtStyle, CampaignStatus, DesignerLevel } from "@prisma/client";
import { redirect } from "next/navigation";
import { auth } from "../../../../auth";
import { buildArtBriefDraft, inferArtStyle, inferDesignerLevel, selectRealArtTemplate } from "@/lib/art";
import {
  getCurrentCompanyIdForUser,
  hasFeatureLimitAvailable
} from "@/lib/billing/usage";
import { getCompanyProfileContext } from "@/lib/company/profile-context";
import { prisma } from "@/lib/database/prisma";
import { generateCampaignWithOpenAI } from "@/lib/openai/campaign-generator";
import { OPENAI_MISSING_KEY_MESSAGE } from "@/lib/openai/settings";

function readRequiredField(formData: FormData, field: string) {
  const value = String(formData.get(field) ?? "").trim();

  if (!value) redirect("/campanhas?error=invalid");
  return value;
}

function readContentCount(formData: FormData) {
  const value = Number(formData.get("contentCount"));

  if (!Number.isInteger(value) || value < 1 || value > 30) {
    redirect("/campanhas?error=invalid");
  }

  return value;
}

function readFormats(formData: FormData) {
  const values = formData.getAll("formats").map(String);
  const formats = values.filter((value): value is ArtFormat =>
    Object.values(ArtFormat).includes(value as ArtFormat)
  );

  return formats.length ? formats : [ArtFormat.FEED_QUADRADO];
}

function readArtStyle(formData: FormData) {
  const value = String(formData.get("artStyle") ?? "").trim();

  if (!value) return null;
  if (!Object.values(ArtStyle).includes(value as ArtStyle)) {
    redirect("/campanhas?error=invalid");
  }

  return value as ArtStyle;
}

function readDesignerLevel(formData: FormData) {
  const value = String(formData.get("designerLevel") ?? "").trim();

  if (!value) return null;
  if (!Object.values(DesignerLevel).includes(value as DesignerLevel)) {
    redirect("/campanhas?error=invalid");
  }

  return value as DesignerLevel;
}

function parseDate(value: string) {
  const date = new Date(`${value}T12:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    redirect("/campanhas?error=invalid");
  }

  return date;
}

async function getCurrentCompanyContext() {
  const session = await auth();

  if (!session?.user?.id) redirect("/login");
  const membership = await getCurrentCompanyIdForUser(session.user.id);

  if (!membership) redirect("/cadastro");
  return membership;
}

async function getCampaignItem(companyId: string, itemId: string) {
  const item = await prisma.campaignItem.findFirst({
    where: { id: itemId, companyId },
    include: { campaign: true }
  });

  if (!item) redirect("/campanhas?error=invalid");
  return item;
}

export async function generateCampaignAction(formData: FormData) {
  const { companyId, userId } = await getCurrentCompanyContext();
  const canGenerateCampaign = await hasFeatureLimitAvailable(companyId, "campaigns");

  if (!canGenerateCampaign) {
    redirect("/campanhas?error=limit");
  }

  const startDate = readRequiredField(formData, "startDate");
  const endDate = readRequiredField(formData, "endDate");
  const input = {
    mainTopic: readRequiredField(formData, "mainTopic"),
    objective: readRequiredField(formData, "objective"),
    platform: readRequiredField(formData, "platform"),
    startDate,
    endDate,
    contentCount: readContentCount(formData),
    desiredFormats: readFormats(formData),
    artStyle: readArtStyle(formData),
    designerLevel: readDesignerLevel(formData),
    companyProfile: await getCompanyProfileContext(companyId)
  };

  let generated;

  try {
    generated = await generateCampaignWithOpenAI(input);
  } catch (error) {
    if (error instanceof Error && error.message === OPENAI_MISSING_KEY_MESSAGE) {
      redirect("/campanhas?error=openai-key");
    }

    redirect("/campanhas?error=openai");
  }

  const campaign = await prisma.campaign.create({
    data: {
      companyId,
      userId,
      title: generated.title,
      objective: input.objective,
      mainTopic: input.mainTopic,
      platform: input.platform,
      startDate: parseDate(startDate),
      endDate: parseDate(endDate),
      status: "GENERATED",
      items: {
        create: generated.items.map((item) => ({
          companyId,
          userId,
          title: item.title,
          contentType: item.contentType,
          postIdea: item.postIdea,
          caption: item.caption,
          cta: item.cta,
          hashtags: item.hashtags,
          suggestedDate: parseDate(item.suggestedDate),
          artFormat: item.artFormat,
          artStyle: item.artStyle,
          designerLevel: item.designerLevel,
          status: "GENERATED"
        }))
      }
    },
    select: { id: true }
  });

  redirect(`/campanhas?campaignId=${campaign.id}&generated=true`);
}

export async function createPostFromCampaignItemAction(formData: FormData) {
  const { companyId, userId } = await getCurrentCompanyContext();
  const item = await getCampaignItem(companyId, readRequiredField(formData, "itemId"));

  if (item.generatedPostId) {
    redirect(`/campanhas?campaignId=${item.campaignId}&error=duplicate`);
  }

  const canCreatePost = await hasFeatureLimitAvailable(companyId, "posts");

  if (!canCreatePost) {
    redirect(`/campanhas?campaignId=${item.campaignId}&error=limit`);
  }

  const post = await prisma.generatedPost.create({
    data: {
      companyId,
      userId,
      businessType: item.campaign.mainTopic,
      objective: item.campaign.objective,
      tone: "Campanha",
      platform: item.campaign.platform,
      prompt: `Campanha: ${item.campaign.title}`,
      title: item.title,
      content: item.postIdea,
      hashtags: item.hashtags,
      cta: item.cta,
      formatSuggestion: item.contentType
    },
    select: { id: true }
  });
  await prisma.campaignItem.updateMany({
    where: { id: item.id, companyId },
    data: { generatedPostId: post.id }
  });

  redirect(`/campanhas?campaignId=${item.campaignId}&created=post`);
}

export async function createCaptionFromCampaignItemAction(formData: FormData) {
  const { companyId, userId } = await getCurrentCompanyContext();
  const item = await getCampaignItem(companyId, readRequiredField(formData, "itemId"));

  if (item.generatedCaptionId) {
    redirect(`/campanhas?campaignId=${item.campaignId}&error=duplicate`);
  }

  const canCreateCaption = await hasFeatureLimitAvailable(companyId, "captions");

  if (!canCreateCaption) {
    redirect(`/campanhas?campaignId=${item.campaignId}&error=limit`);
  }

  const caption = await prisma.generatedCaption.create({
    data: {
      companyId,
      userId,
      platform: item.campaign.platform,
      subject: item.title,
      tone: "Campanha",
      caption: item.caption,
      emojis: [],
      hashtags: item.hashtags,
      cta: item.cta
    },
    select: { id: true }
  });
  await prisma.campaignItem.updateMany({
    where: { id: item.id, companyId },
    data: { generatedCaptionId: caption.id }
  });

  redirect(`/campanhas?campaignId=${item.campaignId}&created=caption`);
}

export async function createCalendarFromCampaignItemAction(formData: FormData) {
  const { companyId, userId } = await getCurrentCompanyContext();
  const item = await getCampaignItem(companyId, readRequiredField(formData, "itemId"));
  const canCreateCalendar = await hasFeatureLimitAvailable(companyId, "calendars");

  if (!canCreateCalendar) {
    redirect(`/campanhas?campaignId=${item.campaignId}&error=limit`);
  }

  await prisma.editorialCalendarItem.create({
    data: {
      companyId,
      userId,
      title: item.title,
      description: item.postIdea,
      platform: item.campaign.platform,
      contentType: item.contentType,
      objective: item.campaign.objective,
      suggestedDate: item.suggestedDate,
      status: "PLANNED"
    }
  });

  redirect(`/campanhas?campaignId=${item.campaignId}&created=calendar`);
}

export async function createArtDraftFromCampaignItemAction(formData: FormData) {
  const { companyId, userId } = await getCurrentCompanyContext();
  const item = await getCampaignItem(companyId, readRequiredField(formData, "itemId"));

  if (item.generatedArtId) {
    redirect(`/campanhas?campaignId=${item.campaignId}&error=duplicate`);
  }

  const canCreateArt = await hasFeatureLimitAvailable(companyId, "arts");

  if (!canCreateArt) {
    redirect(`/campanhas?campaignId=${item.campaignId}&error=limit`);
  }

  const companyProfile = await getCompanyProfileContext(companyId);
  const style =
    item.artStyle ??
    inferArtStyle({
      segmentName: companyProfile?.businessSegment?.name,
      specialtyName: companyProfile?.businessSpecialty?.name,
      objective: item.postIdea
    });
  const designerLevel =
    item.designerLevel ??
    inferDesignerLevel({
      segmentName: companyProfile?.businessSegment?.name,
      specialtyName: companyProfile?.businessSpecialty?.name
    });
  const realTemplate = selectRealArtTemplate({
    segmentName: companyProfile?.businessSegment?.name,
    specialtyName: companyProfile?.businessSpecialty?.name,
    style,
    objective: item.postIdea,
    format: item.artFormat,
    hasImage: Boolean(companyProfile?.images?.length)
  });
  const brief = buildArtBriefDraft({
    subject: item.title,
    objective: item.postIdea,
    platform: item.campaign.platform,
    format: item.artFormat,
    style,
    designerLevel,
    selectedTemplate: realTemplate
  });

  const artwork = await prisma.generatedArt.create({
    data: {
      companyId,
      userId,
      subject: item.title,
      objective: item.postIdea,
      platform: item.campaign.platform,
      title: item.title,
      format: item.artFormat,
      style,
      designerLevel,
      width: brief.width,
      height: brief.height,
      aspectRatio: brief.aspectRatio,
      prompt: `Campanha: ${item.campaign.title}\nBriefing: ${item.postIdea}`,
      templateMetadata: {
        ...brief.templateMetadata,
        selectedRealTemplate: brief.selectedTemplate,
        layoutStructure: brief.layoutStructure,
        logoPlacement: brief.logoPlacement,
        imagePlacement: brief.imagePlacement,
        titlePlacement: brief.titlePlacement,
        subtitlePlacement: brief.subtitlePlacement,
        ctaPlacement: brief.ctaPlacement,
        graphicElements: brief.graphicElements,
        compositionRules: brief.compositionRules
      },
      status: "DRAFT"
    },
    select: { id: true }
  });
  await prisma.campaignItem.updateMany({
    where: { id: item.id, companyId },
    data: { generatedArtId: artwork.id }
  });

  redirect(`/campanhas?campaignId=${item.campaignId}&created=art`);
}

export async function scheduleCampaignItemAction(formData: FormData) {
  const { companyId, userId } = await getCurrentCompanyContext();
  const item = await getCampaignItem(companyId, readRequiredField(formData, "itemId"));

  if (item.scheduledPostId) {
    redirect(`/campanhas?campaignId=${item.campaignId}&error=duplicate`);
  }

  const scheduledPost = await prisma.scheduledPost.create({
    data: {
      companyId,
      userId,
      title: item.title,
      content: `${item.caption}\n\n${item.cta}\n${item.hashtags.join(" ")}`,
      platform: item.campaign.platform,
      scheduledFor: item.suggestedDate,
      notes: `Campanha: ${item.campaign.title}`,
      status: "SCHEDULED"
    },
    select: { id: true }
  });

  await prisma.campaignItem.updateMany({
    where: { id: item.id, companyId },
    data: {
      scheduledPostId: scheduledPost.id,
      status: "SCHEDULED" as CampaignStatus
    }
  });

  redirect(`/campanhas?campaignId=${item.campaignId}&created=schedule`);
}
