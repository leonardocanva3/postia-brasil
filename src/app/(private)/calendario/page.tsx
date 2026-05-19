import { redirect } from "next/navigation";
import { auth } from "../../../../auth";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { prisma } from "@/lib/database/prisma";
import {
  deleteEditorialCalendarItemAction,
  generateEditorialCalendarAction,
  updateEditorialCalendarItemStatusAction
} from "./actions";

const statusOptions = [
  "IDEA",
  "PLANNED",
  "IN_PRODUCTION",
  "READY",
  "PUBLISHED",
  "CANCELED"
] as const;

type CalendarioPageProps = Readonly<{
  searchParams: Promise<{
    error?: string;
    saved?: string;
  }>;
}>;

async function getCompanyIdForCurrentUser() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const membership = await prisma.companyMember.findFirst({
    where: {
      userId: session.user.id
    },
    orderBy: {
      createdAt: "asc"
    },
    select: {
      companyId: true
    }
  });

  if (!membership) {
    redirect("/cadastro");
  }

  return membership.companyId;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC"
  }).format(date);
}

export default async function CalendarioPage({
  searchParams
}: CalendarioPageProps) {
  const params = await searchParams;
  const companyId = await getCompanyIdForCurrentUser();
  const items = await prisma.editorialCalendarItem.findMany({
    where: { companyId },
    orderBy: [{ suggestedDate: "asc" }, { createdAt: "desc" }],
    take: 60
  });

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
          Calendario Editorial
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-gray-950">
          Calendario
        </h1>
        <p className="mt-3 text-gray-700">
          Gere sugestoes mensais com IA e acompanhe o status de cada ideia.
        </p>
      </div>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
        <form
          action={generateEditorialCalendarAction}
          className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-gray-950">
            Gerar calendario mensal
          </h2>
          {params.error === "invalid" ? (
            <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              Preencha os campos corretamente para gerar o calendario.
            </p>
          ) : null}
          {params.error === "openai" ? (
            <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              Nao foi possivel gerar sugestoes agora. Verifique a configuracao
              da OpenAI.
            </p>
          ) : null}
          {params.error === "limit" ? (
            <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Limite mensal de calendarios atingido para o plano atual.
            </p>
          ) : null}
          {params.saved === "true" ? (
            <p className="mt-3 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              Sugestoes geradas e salvas no calendario.
            </p>
          ) : null}
          <div className="mt-5 space-y-5">
            <label className="block">
              <span className="text-sm font-medium text-gray-800">
                Tipo de negocio
              </span>
              <input
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                name="businessType"
                placeholder="Clinica, restaurante, ecommerce..."
                required
                type="text"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-800">
                Mes de referencia
              </span>
              <input
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                name="referenceMonth"
                required
                type="month"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-800">
                Quantidade de ideias
              </span>
              <input
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                defaultValue={12}
                max={31}
                min={1}
                name="ideasCount"
                required
                type="number"
              />
            </label>
            <fieldset>
              <legend className="text-sm font-medium text-gray-800">
                Plataformas
              </legend>
              <div className="mt-2 grid grid-cols-2 gap-3">
                {["Instagram", "LinkedIn", "Facebook", "TikTok"].map(
                  (platform) => (
                    <label
                      className="flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800"
                      key={platform}
                    >
                      <input
                        className="size-4 accent-emerald-700"
                        defaultChecked={platform === "Instagram"}
                        name="platforms"
                        type="checkbox"
                        value={platform}
                      />
                      {platform}
                    </label>
                  )
                )}
              </div>
            </fieldset>
            <label className="block">
              <span className="text-sm font-medium text-gray-800">
                Tom de voz
              </span>
              <select
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                defaultValue="Profissional"
                name="tone"
                required
              >
                <option>Profissional</option>
                <option>Descontraido</option>
                <option>Inspirador</option>
                <option>Educativo</option>
                <option>Vendedor</option>
              </select>
            </label>
          </div>
          <button
            className="mt-6 w-full rounded-md bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
            type="submit"
          >
            Gerar e salvar sugestoes
          </button>
        </form>

        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-950">
                Itens do calendario
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Lista ordenada por data sugerida.
              </p>
            </div>
            <span className="text-sm font-medium text-gray-600">
              {items.length} itens
            </span>
          </div>

          <div className="mt-6 space-y-4">
            {items.length > 0 ? (
              items.map((item) => (
                <article
                  className="rounded-md border border-gray-200 p-4"
                  key={item.id}
                >
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div>
                      <p className="text-sm font-medium text-emerald-700">
                        {formatDate(item.suggestedDate)}
                      </p>
                      <h3 className="mt-2 font-semibold text-gray-950">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-gray-700">
                        {item.description}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                          {item.platform}
                        </span>
                        <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                          {item.contentType}
                        </span>
                        <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                          {item.objective}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row xl:flex-col">
                      <form
                        action={updateEditorialCalendarItemStatusAction}
                        className="flex gap-2"
                      >
                        <input name="itemId" type="hidden" value={item.id} />
                        <select
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                          defaultValue={item.status}
                          name="status"
                        >
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                        <button
                          className="rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
                          type="submit"
                        >
                          Salvar
                        </button>
                      </form>
                      <form action={deleteEditorialCalendarItemAction}>
                        <input name="itemId" type="hidden" value={item.id} />
                        <ConfirmDialog message="Excluir este item do calendario?">
                          <button
                            className="w-full rounded-md border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                            type="submit"
                          >
                            Excluir
                          </button>
                        </ConfirmDialog>
                      </form>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <p className="rounded-md border border-dashed border-gray-300 p-6 text-sm text-gray-600">
                Nenhum item no calendario ainda.
              </p>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
