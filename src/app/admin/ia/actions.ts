"use server";

import { redirect } from "next/navigation";
import { requirePlatformAdmin } from "@/lib/admin/access";
import { prisma } from "@/lib/database/prisma";
import { openai } from "@/lib/openai/openai-client";
import {
  assertOpenAIKeyConfigured,
  getActiveAISettings,
  getOrCreateAISettings,
  OPENAI_MISSING_KEY_MESSAGE
} from "@/lib/openai/settings";

function readRequiredField(formData: FormData, field: string) {
  const value = String(formData.get(field) ?? "").trim();

  if (!value) {
    redirect("/admin/ia?error=invalid");
  }

  return value;
}

function readTemperature(formData: FormData) {
  const value = Number(formData.get("temperature"));

  if (!Number.isFinite(value) || value < 0 || value > 2) {
    redirect("/admin/ia?error=invalid");
  }

  return value;
}

function readMaxTokens(formData: FormData) {
  const value = Number(formData.get("maxTokens"));

  if (!Number.isInteger(value) || value < 100 || value > 20_000) {
    redirect("/admin/ia?error=invalid");
  }

  return value;
}

export async function saveAISettingsAction(formData: FormData) {
  await requirePlatformAdmin();

  const settings = await getOrCreateAISettings();

  await prisma.aISettings.update({
    where: { id: settings.id },
    data: {
      provider: "OPENAI",
      textModel: readRequiredField(formData, "textModel"),
      imageModel: readRequiredField(formData, "imageModel"),
      temperature: readTemperature(formData),
      maxTokens: readMaxTokens(formData),
      isActive: formData.get("isActive") === "on"
    }
  });

  redirect("/admin/ia?saved=true");
}

export async function testOpenAIConnection() {
  await requirePlatformAdmin();

  try {
    assertOpenAIKeyConfigured();
  } catch {
    redirect(
      `/admin/ia?test=error&message=${encodeURIComponent(OPENAI_MISSING_KEY_MESSAGE)}`
    );
  }

  const settings = await getActiveAISettings();

  try {
    const completion = await openai.chat.completions.create({
      model: settings.textModel,
      messages: [
        {
          role: "system",
          content:
            "Responda de forma curta para validar a conexao administrativa do PostIA Brasil."
        },
        {
          role: "user",
          content: "Teste de conexao. Responda apenas: PostIA OK"
        }
      ],
      temperature: 0,
      max_tokens: 20
    });
    const content = completion.choices[0]?.message?.content?.trim();

    if (!content) {
      throw new Error("Resposta vazia da OpenAI.");
    }
  } catch (error) {
    console.error("Erro ao testar conexao OpenAI", {
      message: error instanceof Error ? error.message : "Erro desconhecido",
      model: settings.textModel
    });

    redirect(
      `/admin/ia?test=error&message=${encodeURIComponent(
        "Não foi possível conectar com a OpenAI. Confira o modelo configurado e tente novamente."
      )}`
    );
  }

  redirect("/admin/ia?test=success");
}
