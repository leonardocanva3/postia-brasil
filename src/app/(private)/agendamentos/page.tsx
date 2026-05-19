import { ScheduledPostStatus } from "@prisma/client";
import { redirect } from "next/navigation";
import { auth } from "../../../../auth";
import { getCurrentCompanyIdForUser } from "@/lib/billing/usage";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { prisma } from "@/lib/database/prisma";
import {
  createScheduledPostAction,
  createScheduledPostFromCalendarAction,
  deleteScheduledPostAction,
  updateScheduledPostAction,
  updateScheduledPostStatusAction
} from "./actions";

const statusOptions = [
  "DRAFT",
  "SCHEDULED",
  "PUBLISHED",
  "CANCELED"
] as const;
const platformOptions = ["Instagram", "LinkedIn", "Facebook", "TikTok"] as const;

type AgendamentosPageProps = Readonly<{
  searchParams: Promise<{
    status?: string;
    platform?: string;
    error?: string;
    saved?: string;
  }>;
}>;

async function getCompanyIdForCurrentUser() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const membership = await getCurrentCompanyIdForUser(session.user.id);

  if (!membership) {
    redirect("/cadastro");
  }

  return membership.companyId;
}

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(value);
}

function toDateTimeLocalValue(value: Date) {
  const offsetMs = value.getTimezoneOffset() * 60 * 1000;
  const localDate = new Date(value.getTime() - offsetMs);

  return localDate.toISOString().slice(0, 16);
}

export default async function AgendamentosPage({
  searchParams
}: AgendamentosPageProps) {
  const params = await searchParams;
  const companyId = await getCompanyIdForCurrentUser();
  const status = Object.values(ScheduledPostStatus).includes(
    params.status as ScheduledPostStatus
  )
    ? (params.status as ScheduledPostStatus)
    : undefined;
  const platform = params.platform || undefined;
  const [scheduledPosts, calendarItems] = await Promise.all([
    prisma.scheduledPost.findMany({
      where: {
        companyId,
        ...(status ? { status } : {}),
        ...(platform ? { platform } : {})
      },
      orderBy: [{ scheduledFor: "asc" }, { createdAt: "desc" }]
    }),
    prisma.editorialCalendarItem.findMany({
      where: {
        companyId
      },
      orderBy: [{ suggestedDate: "asc" }, { createdAt: "desc" }],
      take: 30
    })
  ]);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
            Agendamentos
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-gray-950">
            Conteudos agendados
          </h1>
          <p className="mt-3 text-gray-700">
            Planeje, acompanhe e publique conteudos por plataforma.
          </p>
        </div>
        <a
          className="rounded-md bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
          href="#novo-agendamento"
        >
          Novo agendamento
        </a>
      </div>

      {params.error === "invalid" ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          Preencha os campos corretamente para salvar o agendamento.
        </p>
      ) : null}
      {params.saved === "true" ? (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Agendamento salvo com sucesso.
        </p>
      ) : null}

      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <form className="grid gap-4 md:grid-cols-[1fr_1fr_auto]" action="/agendamentos">
          <label className="block">
            <span className="text-sm font-medium text-gray-800">Status</span>
            <select
              className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              defaultValue={params.status ?? ""}
              name="status"
            >
              <option value="">Todos</option>
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-800">Plataforma</span>
            <select
              className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              defaultValue={params.platform ?? ""}
              name="platform"
            >
              <option value="">Todas</option>
              {platformOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <button
            className="self-end rounded-md border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
            type="submit"
          >
            Filtrar
          </button>
        </form>
      </section>

      <section className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <div className="space-y-6">
          <form
            action={createScheduledPostAction}
            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
            id="novo-agendamento"
          >
            <h2 className="text-lg font-semibold text-gray-950">
              Novo agendamento
            </h2>
            <div className="mt-5 space-y-5">
              <label className="block">
                <span className="text-sm font-medium text-gray-800">Titulo</span>
                <input
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  name="title"
                  required
                  type="text"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-800">Conteudo</span>
                <textarea
                  className="mt-2 min-h-28 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  name="content"
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-800">Plataforma</span>
                <select
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  defaultValue="Instagram"
                  name="platform"
                  required
                >
                  {platformOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-800">
                  Data e hora
                </span>
                <input
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  name="scheduledFor"
                  required
                  type="datetime-local"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-800">
                  Observacoes
                </span>
                <textarea
                  className="mt-2 min-h-20 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  name="notes"
                />
              </label>
            </div>
            <button
              className="mt-6 w-full rounded-md bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
              type="submit"
            >
              Salvar agendamento
            </button>
          </form>

          <form
            action={createScheduledPostFromCalendarAction}
            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-gray-950">
              Criar a partir do calendario
            </h2>
            <div className="mt-5 space-y-5">
              <label className="block">
                <span className="text-sm font-medium text-gray-800">
                  Item editorial
                </span>
                <select
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  name="editorialCalendarItemId"
                  required
                >
                  <option value="">Selecione</option>
                  {calendarItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {formatDateTime(item.suggestedDate)} - {item.title}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-800">
                  Data e hora opcional
                </span>
                <input
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  name="scheduledFor"
                  type="datetime-local"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-800">
                  Observacoes
                </span>
                <textarea
                  className="mt-2 min-h-20 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  name="notes"
                />
              </label>
            </div>
            <button
              className="mt-6 w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
              type="submit"
            >
              Criar agendamento
            </button>
          </form>
        </div>

        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-950">
                Lista de agendamentos
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                {scheduledPosts.length} conteudos encontrados.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            {scheduledPosts.length > 0 ? (
              scheduledPosts.map((post) => (
                <article
                  className="rounded-md border border-gray-200 p-4"
                  key={post.id}
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-sm font-medium text-emerald-700">
                        {formatDateTime(post.scheduledFor)}
                      </p>
                      <h3 className="mt-2 font-semibold text-gray-950">
                        {post.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-gray-700">
                        {post.content}
                      </p>
                      {post.notes ? (
                        <p className="mt-2 text-sm text-gray-500">
                          Obs.: {post.notes}
                        </p>
                      ) : null}
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                          {post.platform}
                        </span>
                        <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                          {post.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <form action={updateScheduledPostStatusAction}>
                        <input name="itemId" type="hidden" value={post.id} />
                        <input name="status" type="hidden" value="PUBLISHED" />
                        <button
                          className="rounded-md border border-emerald-200 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
                          type="submit"
                        >
                          Publicado
                        </button>
                      </form>
                      <form action={updateScheduledPostStatusAction}>
                        <input name="itemId" type="hidden" value={post.id} />
                        <input name="status" type="hidden" value="CANCELED" />
                        <button
                          className="rounded-md border border-amber-200 px-3 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-50"
                          type="submit"
                        >
                          Cancelar
                        </button>
                      </form>
                      <form action={deleteScheduledPostAction}>
                        <input name="itemId" type="hidden" value={post.id} />
                        <ConfirmDialog message="Excluir este agendamento? Essa acao nao pode ser desfeita.">
                          <button
                            className="rounded-md border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                            type="submit"
                          >
                            Excluir
                          </button>
                        </ConfirmDialog>
                      </form>
                    </div>
                  </div>

                  <form
                    action={updateScheduledPostAction}
                    className="mt-5 grid gap-3 border-t border-gray-100 pt-4 md:grid-cols-2"
                  >
                    <input name="itemId" type="hidden" value={post.id} />
                    <label className="block">
                      <span className="text-xs font-medium text-gray-600">
                        Titulo
                      </span>
                      <input
                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                        defaultValue={post.title}
                        name="title"
                        required
                        type="text"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-medium text-gray-600">
                        Plataforma
                      </span>
                      <select
                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                        defaultValue={post.platform}
                        name="platform"
                        required
                      >
                        {platformOptions.map((option) => (
                          <option key={option}>{option}</option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-xs font-medium text-gray-600">
                        Data e hora
                      </span>
                      <input
                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                        defaultValue={toDateTimeLocalValue(post.scheduledFor)}
                        name="scheduledFor"
                        required
                        type="datetime-local"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-medium text-gray-600">
                        Observacoes
                      </span>
                      <input
                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                        defaultValue={post.notes ?? ""}
                        name="notes"
                        type="text"
                      />
                    </label>
                    <label className="block md:col-span-2">
                      <span className="text-xs font-medium text-gray-600">
                        Conteudo
                      </span>
                      <textarea
                        className="mt-1 min-h-24 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                        defaultValue={post.content}
                        name="content"
                        required
                      />
                    </label>
                    <button
                      className="rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-100 md:col-span-2"
                      type="submit"
                    >
                      Editar agendamento
                    </button>
                  </form>
                </article>
              ))
            ) : (
              <p className="rounded-md border border-dashed border-gray-300 p-6 text-sm text-gray-600">
                Nenhum agendamento encontrado.
              </p>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
