import { getOrCreateAISettings, hasOpenAIKey } from "@/lib/openai/settings";
import { LoadingButton } from "@/components/ui/loading-button";
import { Notice } from "@/components/ui/notice";
import { SectionCard } from "@/components/ui/section-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { saveAISettingsAction, testOpenAIConnection } from "./actions";

export const dynamic = "force-dynamic";

type AdminIAPageProps = Readonly<{
  searchParams: Promise<{
    saved?: string;
    test?: string;
    message?: string;
    error?: string;
  }>;
}>;

export default async function AdminIAPage({ searchParams }: AdminIAPageProps) {
  const params = await searchParams;
  const settings = await getOrCreateAISettings();
  const openAIKeyConfigured = hasOpenAIKey();

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
          Admin
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-gray-950">
          IA / OpenAI
        </h1>
        <p className="mt-3 text-gray-700">
          Configure modelos, limites e diagnostique a conexao antes dos modulos
          usarem IA.
        </p>
      </div>

      {params.saved === "true" ? (
        <Notice tone="success">Configuracao de IA salva com sucesso.</Notice>
      ) : null}
      {params.test === "success" ? (
        <Notice tone="success">Conexao com a OpenAI testada com sucesso.</Notice>
      ) : null}
      {params.test === "error" ? (
        <Notice tone="error">
          {params.message ?? "Nao foi possivel testar a conexao com a OpenAI."}
        </Notice>
      ) : null}
      {params.error === "invalid" ? (
        <Notice tone="error">
          Revise modelos, temperatura entre 0 e 2, e limite de tokens entre 100 e
          20000.
        </Notice>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <SectionCard
          description="A chave continua fora do banco de dados. Use OPENAI_API_KEY no arquivo .env."
          title="Configuracao principal"
        >
          <form action={saveAISettingsAction} className="space-y-5">
            <label className="block">
              <span className="text-sm font-medium text-gray-800">
                Modelo de texto
              </span>
              <input
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                defaultValue={settings.textModel}
                name="textModel"
                placeholder="gpt-4.1-mini"
                required
                type="text"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-800">
                Modelo de imagem
              </span>
              <input
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                defaultValue={settings.imageModel}
                name="imageModel"
                placeholder="gpt-image-1"
                required
                type="text"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-gray-800">
                  Temperatura
                </span>
                <input
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  defaultValue={settings.temperature}
                  max={2}
                  min={0}
                  name="temperature"
                  required
                  step={0.1}
                  type="number"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-800">
                  Limite de tokens
                </span>
                <input
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  defaultValue={settings.maxTokens}
                  max={20000}
                  min={100}
                  name="maxTokens"
                  required
                  step={100}
                  type="number"
                />
              </label>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-800">
              <input
                className="size-4 accent-emerald-700"
                defaultChecked={settings.isActive}
                name="isActive"
                type="checkbox"
              />
              Configuracao ativa
            </label>
            <LoadingButton className="w-full" loadingText="Salvando IA...">
              Salvar configuracao
            </LoadingButton>
          </form>
        </SectionCard>

        <SectionCard title="Diagnostico">
          <dl className="space-y-4 text-sm text-gray-700">
            <div className="flex items-center justify-between gap-4">
              <dt>OPENAI_API_KEY</dt>
              <dd>
                <StatusBadge
                  status={openAIKeyConfigured ? "CONFIGURADA" : "AUSENTE"}
                />
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt>Provider</dt>
              <dd className="font-medium text-gray-950">{settings.provider}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt>Status</dt>
              <dd>
                <StatusBadge status={settings.isActive ? "ACTIVE" : "CANCELED"} />
              </dd>
            </div>
          </dl>
          {!openAIKeyConfigured ? (
            <p className="mt-5 rounded-md bg-amber-50 p-3 text-sm leading-6 text-amber-800">
              Chave da OpenAI não configurada. Configure OPENAI_API_KEY no arquivo .env.
            </p>
          ) : null}
          <form action={testOpenAIConnection} className="mt-5">
            <LoadingButton className="w-full" loadingText="Testando conexao...">
              Testar conexao
            </LoadingButton>
          </form>
        </SectionCard>
      </section>
    </main>
  );
}
