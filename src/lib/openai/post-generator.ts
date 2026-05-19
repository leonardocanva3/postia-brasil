import { openai } from "@/lib/openai/openai-client";

export type GeneratePostInput = Readonly<{
  businessType: string;
  objective: string;
  platform: string;
  tone: string;
}>;

export type GeneratedPostOutput = Readonly<{
  title: string;
  content: string;
  cta: string;
  hashtags: string[];
  formatSuggestion: string;
}>;

function assertGeneratedPostOutput(value: unknown): GeneratedPostOutput {
  if (!value || typeof value !== "object") {
    throw new Error("A OpenAI retornou uma resposta invalida.");
  }

  const data = value as Partial<GeneratedPostOutput>;

  if (
    typeof data.title !== "string" ||
    typeof data.content !== "string" ||
    typeof data.cta !== "string" ||
    typeof data.formatSuggestion !== "string" ||
    !Array.isArray(data.hashtags)
  ) {
    throw new Error("A OpenAI retornou um JSON fora do formato esperado.");
  }

  return {
    title: data.title,
    content: data.content,
    cta: data.cta,
    formatSuggestion: data.formatSuggestion,
    hashtags: data.hashtags.map(String)
  };
}

export function buildPostGeneratorPrompt(input: GeneratePostInput) {
  return [
    "Gere um post profissional em portugues do Brasil para uma empresa.",
    `Tipo de negocio: ${input.businessType}`,
    `Objetivo do post: ${input.objective}`,
    `Plataforma: ${input.platform}`,
    `Tom de voz: ${input.tone}`,
    "Retorne apenas JSON valido com as chaves: title, content, cta, hashtags, formatSuggestion.",
    "hashtags deve ser um array de strings."
  ].join("\n");
}

export async function generatePostWithOpenAI(
  input: GeneratePostInput
): Promise<GeneratedPostOutput> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Configure OPENAI_API_KEY para gerar posts.");
  }

  const prompt = buildPostGeneratorPrompt(input);

  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "Voce e um estrategista de social media para pequenas e medias empresas brasileiras."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    response_format: { type: "json_object" },
    temperature: 0.7
  });

  const content = completion.choices[0]?.message?.content;

  if (!content) {
    throw new Error("A OpenAI nao retornou conteudo.");
  }

  return assertGeneratedPostOutput(JSON.parse(content));
}
