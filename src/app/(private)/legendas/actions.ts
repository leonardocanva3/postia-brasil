"use server";

import { redirect } from "next/navigation";
import { auth } from "../../../../auth";
import {
  getCurrentCompanyIdForUser,
  hasFeatureLimitAvailable
} from "@/lib/billing/usage";
import { prisma } from "@/lib/database/prisma";
import { generateCaptionWithOpenAI } from "@/lib/openai/caption-generator";

function readRequiredField(formData: FormData, field: string) {
  const value = String(formData.get(field) ?? "").trim();

  if (!value) {
    redirect("/legendas?error=invalid");
  }

  return value;
}

function readHashtagCount(formData: FormData) {
  const value = Number(formData.get("hashtagCount"));

  if (!Number.isInteger(value) || value < 0 || value > 30) {
    redirect("/legendas?error=invalid");
  }

  return value;
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

export async function generateCaptionAction(formData: FormData) {
  const { companyId, userId } = await getCurrentCompanyContext();
  const canGenerateCaption = await hasFeatureLimitAvailable(companyId, "captions");

  if (!canGenerateCaption) {
    redirect("/legendas?error=limit");
  }

  const input = {
    subject: readRequiredField(formData, "subject"),
    platform: readRequiredField(formData, "platform"),
    tone: readRequiredField(formData, "tone"),
    hashtagCount: readHashtagCount(formData),
    useEmojis: formData.get("useEmojis") === "yes"
  };
  let generatedCaption;

  try {
    generatedCaption = await generateCaptionWithOpenAI(input);
  } catch {
    redirect("/legendas?error=openai");
  }

  const caption = await prisma.generatedCaption.create({
    data: {
      companyId,
      userId,
      platform: input.platform,
      subject: input.subject,
      tone: input.tone,
      caption: generatedCaption.caption,
      emojis: generatedCaption.emojis,
      hashtags: generatedCaption.hashtags,
      cta: generatedCaption.cta
    },
    select: {
      id: true
    }
  });

  redirect(`/legendas?generatedCaptionId=${caption.id}`);
}
