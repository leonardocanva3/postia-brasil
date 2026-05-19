"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "../../../../auth";
import { getCurrentCompanyIdForUser } from "@/lib/billing/usage";
import { prisma } from "@/lib/database/prisma";

function readRequiredField(formData: FormData, field: string) {
  const value = String(formData.get(field) ?? "").trim();

  if (!value) {
    redirect("/whatsapp?error=invalid");
  }

  return value;
}

function readOptionalField(formData: FormData, field: string) {
  const value = String(formData.get(field) ?? "").trim();

  return value || null;
}

function normalizePhone(value: string) {
  const onlyDigits = value.replace(/\D/g, "");

  if (!onlyDigits) {
    redirect("/whatsapp?error=invalid");
  }

  return onlyDigits.startsWith("55") ? onlyDigits : `55${onlyDigits}`;
}

function createWhatsAppUrl(phone: string, message: string) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
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

export async function createWhatsAppContactAction(formData: FormData) {
  const { companyId } = await getCurrentCompanyContext();

  await prisma.whatsAppContact.create({
    data: {
      companyId,
      name: readRequiredField(formData, "name"),
      phone: normalizePhone(readRequiredField(formData, "phone")),
      description: readOptionalField(formData, "description")
    }
  });

  redirect("/whatsapp?saved=true");
}

export async function updateWhatsAppContactAction(formData: FormData) {
  const { companyId } = await getCurrentCompanyContext();
  const contactId = readRequiredField(formData, "contactId");

  await prisma.whatsAppContact.updateMany({
    where: {
      id: contactId,
      companyId
    },
    data: {
      name: readRequiredField(formData, "name"),
      phone: normalizePhone(readRequiredField(formData, "phone")),
      description: readOptionalField(formData, "description"),
      isActive: formData.get("isActive") === "on"
    }
  });

  revalidatePath("/whatsapp");
}

export async function deactivateWhatsAppContactAction(formData: FormData) {
  const { companyId } = await getCurrentCompanyContext();
  const contactId = readRequiredField(formData, "contactId");

  await prisma.whatsAppContact.updateMany({
    where: {
      id: contactId,
      companyId
    },
    data: {
      isActive: false
    }
  });

  revalidatePath("/whatsapp");
}

export async function deleteWhatsAppContactAction(formData: FormData) {
  const { companyId } = await getCurrentCompanyContext();
  const contactId = readRequiredField(formData, "contactId");

  await prisma.whatsAppContact.deleteMany({
    where: {
      id: contactId,
      companyId
    }
  });

  revalidatePath("/whatsapp");
}

async function resolveMessageSource(companyId: string, source: string) {
  const [sourceType, sourceId] = source.split(":");

  if (!sourceType || !sourceId) {
    redirect("/whatsapp?error=invalid");
  }

  if (sourceType === "post") {
    const post = await prisma.generatedPost.findFirst({
      where: { id: sourceId, companyId }
    });

    if (!post) {
      redirect("/whatsapp?error=invalid");
    }

    return {
      generatedPostId: post.id,
      generatedCaptionId: null,
      scheduledPostId: null,
      messageParts: [post.title, post.content, post.cta, post.hashtags.join(" ")]
    };
  }

  if (sourceType === "caption") {
    const caption = await prisma.generatedCaption.findFirst({
      where: { id: sourceId, companyId }
    });

    if (!caption) {
      redirect("/whatsapp?error=invalid");
    }

    return {
      generatedPostId: null,
      generatedCaptionId: caption.id,
      scheduledPostId: null,
      messageParts: [
        caption.caption,
        caption.cta,
        caption.emojis.join(" "),
        caption.hashtags.join(" ")
      ]
    };
  }

  if (sourceType === "schedule") {
    const scheduledPost = await prisma.scheduledPost.findFirst({
      where: { id: sourceId, companyId }
    });

    if (!scheduledPost) {
      redirect("/whatsapp?error=invalid");
    }

    return {
      generatedPostId: null,
      generatedCaptionId: null,
      scheduledPostId: scheduledPost.id,
      messageParts: [scheduledPost.title, scheduledPost.content]
    };
  }

  redirect("/whatsapp?error=invalid");
}

export async function createWhatsAppShareLogAction(formData: FormData) {
  const { companyId, userId } = await getCurrentCompanyContext();
  const contactId = readRequiredField(formData, "contactId");
  const source = readRequiredField(formData, "source");
  const note = readOptionalField(formData, "note");
  const contact = await prisma.whatsAppContact.findFirst({
    where: {
      id: contactId,
      companyId,
      isActive: true
    }
  });

  if (!contact) {
    redirect("/whatsapp?error=invalid");
  }

  const resolvedSource = await resolveMessageSource(companyId, source);
  const message = [...resolvedSource.messageParts, note ? `Obs.: ${note}` : null]
    .filter(Boolean)
    .join("\n\n");
  const log = await prisma.whatsAppShareLog.create({
    data: {
      companyId,
      userId,
      scheduledPostId: resolvedSource.scheduledPostId,
      generatedPostId: resolvedSource.generatedPostId,
      generatedCaptionId: resolvedSource.generatedCaptionId,
      phone: contact.phone,
      message,
      status: "READY"
    },
    select: {
      id: true
    }
  });
  const url = createWhatsAppUrl(contact.phone, message);

  redirect(`/whatsapp?shareLogId=${log.id}&wa=${encodeURIComponent(url)}`);
}
