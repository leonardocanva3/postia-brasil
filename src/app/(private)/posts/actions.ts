"use server";

import { redirect } from "next/navigation";
import { auth } from "../../../../auth";
import { prisma } from "@/lib/database/prisma";
import {
  getCurrentCompanyIdForUser,
  hasFeatureLimitAvailable
} from "@/lib/billing/usage";
import { getCompanyProfileContext } from "@/lib/company/profile-context";
import {
  buildPostGeneratorPrompt,
  generatePostWithOpenAI
} from "@/lib/openai/post-generator";
import { OPENAI_MISSING_KEY_MESSAGE } from "@/lib/openai/settings";

function readRequiredField(formData: FormData, field: string) {
  const value = String(formData.get(field) ?? "").trim();

  if (!value) {
    redirect("/posts?error=invalid");
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

export async function generatePostAction(formData: FormData) {
  const { companyId, userId } = await getCurrentCompanyContext();
  const canGeneratePost = await hasFeatureLimitAvailable(companyId, "posts");

  if (!canGeneratePost) {
    redirect("/posts?error=limit");
  }

  const input = {
    businessType: readRequiredField(formData, "businessType"),
    objective: readRequiredField(formData, "objective"),
    platform: readRequiredField(formData, "platform"),
    tone: readRequiredField(formData, "tone"),
    companyProfile: await getCompanyProfileContext(companyId)
  };
  const prompt = buildPostGeneratorPrompt(input);
  let generatedPost;

  try {
    generatedPost = await generatePostWithOpenAI(input);
  } catch (error) {
    if (error instanceof Error && error.message === OPENAI_MISSING_KEY_MESSAGE) {
      redirect("/posts?error=openai-key");
    }

    redirect("/posts?error=openai");
  }

  const post = await prisma.generatedPost.create({
    data: {
      companyId,
      userId,
      businessType: input.businessType,
      objective: input.objective,
      tone: input.tone,
      platform: input.platform,
      prompt,
      title: generatedPost.title,
      content: generatedPost.content,
      hashtags: generatedPost.hashtags,
      cta: generatedPost.cta,
      formatSuggestion: generatedPost.formatSuggestion
    },
    select: {
      id: true
    }
  });

  redirect(`/posts?generatedPostId=${post.id}`);
}
