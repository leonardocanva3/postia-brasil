"use server";

import { ScheduledPostStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "../../../../auth";
import { getCurrentCompanyIdForUser } from "@/lib/billing/usage";
import { prisma } from "@/lib/database/prisma";

function readRequiredField(formData: FormData, field: string) {
  const value = String(formData.get(field) ?? "").trim();

  if (!value) {
    redirect("/agendamentos?error=invalid");
  }

  return value;
}

function readOptionalField(formData: FormData, field: string) {
  const value = String(formData.get(field) ?? "").trim();

  return value || null;
}

function parseScheduledFor(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    redirect("/agendamentos?error=invalid");
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

export async function createScheduledPostAction(formData: FormData) {
  const { companyId, userId } = await getCurrentCompanyContext();

  await prisma.scheduledPost.create({
    data: {
      companyId,
      userId,
      title: readRequiredField(formData, "title"),
      content: readRequiredField(formData, "content"),
      platform: readRequiredField(formData, "platform"),
      scheduledFor: parseScheduledFor(readRequiredField(formData, "scheduledFor")),
      notes: readOptionalField(formData, "notes"),
      status: "SCHEDULED"
    }
  });

  redirect("/agendamentos?saved=true");
}

export async function createScheduledPostFromCalendarAction(formData: FormData) {
  const { companyId, userId } = await getCurrentCompanyContext();
  const calendarItemId = readRequiredField(formData, "editorialCalendarItemId");
  const scheduledForValue = readOptionalField(formData, "scheduledFor");
  const notes = readOptionalField(formData, "notes");
  const calendarItem = await prisma.editorialCalendarItem.findFirst({
    where: {
      id: calendarItemId,
      companyId
    }
  });

  if (!calendarItem) {
    redirect("/agendamentos?error=invalid");
  }

  await prisma.scheduledPost.create({
    data: {
      companyId,
      userId,
      editorialCalendarItemId: calendarItem.id,
      title: calendarItem.title,
      content: calendarItem.description,
      platform: calendarItem.platform,
      scheduledFor: scheduledForValue
        ? parseScheduledFor(scheduledForValue)
        : calendarItem.suggestedDate,
      notes,
      status: "SCHEDULED"
    }
  });

  redirect("/agendamentos?saved=true");
}

export async function updateScheduledPostAction(formData: FormData) {
  const { companyId } = await getCurrentCompanyContext();
  const itemId = readRequiredField(formData, "itemId");

  await prisma.scheduledPost.updateMany({
    where: {
      id: itemId,
      companyId
    },
    data: {
      title: readRequiredField(formData, "title"),
      content: readRequiredField(formData, "content"),
      platform: readRequiredField(formData, "platform"),
      scheduledFor: parseScheduledFor(readRequiredField(formData, "scheduledFor")),
      notes: readOptionalField(formData, "notes")
    }
  });

  revalidatePath("/agendamentos");
}

export async function updateScheduledPostStatusAction(formData: FormData) {
  const { companyId } = await getCurrentCompanyContext();
  const itemId = readRequiredField(formData, "itemId");
  const status = readRequiredField(formData, "status");

  if (!Object.values(ScheduledPostStatus).includes(status as ScheduledPostStatus)) {
    redirect("/agendamentos?error=invalid");
  }

  await prisma.scheduledPost.updateMany({
    where: {
      id: itemId,
      companyId
    },
    data: {
      status: status as ScheduledPostStatus
    }
  });

  revalidatePath("/agendamentos");
}

export async function deleteScheduledPostAction(formData: FormData) {
  const { companyId } = await getCurrentCompanyContext();
  const itemId = readRequiredField(formData, "itemId");

  await prisma.scheduledPost.deleteMany({
    where: {
      id: itemId,
      companyId
    }
  });

  revalidatePath("/agendamentos");
}
