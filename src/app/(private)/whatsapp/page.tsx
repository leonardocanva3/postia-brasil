import { redirect } from "next/navigation";
import { auth } from "../../../../auth";
import { getCurrentCompanyIdForUser } from "@/lib/billing/usage";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { prisma } from "@/lib/database/prisma";
import {
  createWhatsAppContactAction,
  createWhatsAppShareLogAction,
  deactivateWhatsAppContactAction,
  deleteWhatsAppContactAction,
  updateWhatsAppContactAction
} from "./actions";

type WhatsAppPageProps = Readonly<{
  searchParams: Promise<{
    error?: string;
    saved?: string;
    wa?: string;
    shareLogId?: string;
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

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(value);
}

export default async function WhatsAppPage({ searchParams }: WhatsAppPageProps) {
  const params = await searchParams;
  const companyId = await getCompanyIdForCurrentUser();
  const [contacts, generatedPosts, generatedCaptions, scheduledPosts, logs] =
    await Promise.all([
      prisma.whatsAppContact.findMany({
        where: { companyId },
        orderBy: [{ isActive: "desc" }, { createdAt: "desc" }]
      }),
      prisma.generatedPost.findMany({
        where: { companyId },
        orderBy: { createdAt: "desc" },
        take: 20
      }),
      prisma.generatedCaption.findMany({
        where: { companyId },
        orderBy: { createdAt: "desc" },
        take: 20
      }),
      prisma.scheduledPost.findMany({
        where: { companyId },
        orderBy: { scheduledFor: "desc" },
        take: 20
      }),
      prisma.whatsAppShareLog.findMany({
        where: { companyId },
        orderBy: { createdAt: "desc" },
        take: 10
      })
    ]);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
          WhatsApp
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-gray-950">
          Compartilhamento assistido
        </h1>
        <p className="mt-3 text-gray-700">
          Gere links de envio para WhatsApp sem disparo automatico nesta etapa.
        </p>
      </div>

      {params.error === "invalid" ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          Preencha os campos corretamente para continuar.
        </p>
      ) : null}
      {params.saved === "true" ? (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Contato salvo com sucesso.
        </p>
      ) : null}
      {params.wa ? (
        <section className="rounded-lg border border-emerald-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
            Mensagem pronta
          </p>
          <h2 className="mt-2 text-xl font-semibold text-gray-950">
            Link WhatsApp gerado
          </h2>
          <a
            className="mt-5 inline-flex rounded-md bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
            href={params.wa}
            rel="noreferrer"
            target="_blank"
          >
            Abrir WhatsApp
          </a>
          <p className="mt-3 break-all text-sm text-gray-600">{params.wa}</p>
        </section>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <div className="space-y-6">
          <form
            action={createWhatsAppContactAction}
            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-gray-950">
              Novo contato
            </h2>
            <div className="mt-5 space-y-5">
              <label className="block">
                <span className="text-sm font-medium text-gray-800">Nome</span>
                <input
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  name="name"
                  required
                  type="text"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-800">
                  Telefone
                </span>
                <input
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  name="phone"
                  placeholder="11999999999"
                  required
                  type="tel"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-800">
                  Descricao
                </span>
                <textarea
                  className="mt-2 min-h-20 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  name="description"
                />
              </label>
            </div>
            <button
              className="mt-6 w-full rounded-md bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
              type="submit"
            >
              Cadastrar contato
            </button>
          </form>

          <form
            action={createWhatsAppShareLogAction}
            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-gray-950">
              Gerar mensagem de envio
            </h2>
            <div className="mt-5 space-y-5">
              <label className="block">
                <span className="text-sm font-medium text-gray-800">Contato</span>
                <select
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  name="contactId"
                  required
                >
                  <option value="">Selecione</option>
                  {contacts
                    .filter((contact) => contact.isActive)
                    .map((contact) => (
                      <option key={contact.id} value={contact.id}>
                        {contact.name} - {contact.phone}
                      </option>
                    ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-800">Origem</span>
                <select
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  name="source"
                  required
                >
                  <option value="">Selecione</option>
                  {generatedPosts.map((post) => (
                    <option key={post.id} value={`post:${post.id}`}>
                      Post - {post.title}
                    </option>
                  ))}
                  {generatedCaptions.map((caption) => (
                    <option key={caption.id} value={`caption:${caption.id}`}>
                      Legenda - {caption.subject}
                    </option>
                  ))}
                  {scheduledPosts.map((post) => (
                    <option key={post.id} value={`schedule:${post.id}`}>
                      Agendamento - {post.title}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-800">
                  Observacao opcional
                </span>
                <textarea
                  className="mt-2 min-h-20 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  name="note"
                />
              </label>
            </div>
            <button
              className="mt-6 w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
              type="submit"
            >
              Gerar link WhatsApp
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-950">
              Contatos WhatsApp
            </h2>
            <div className="mt-5 space-y-4">
              {contacts.length > 0 ? (
                contacts.map((contact) => (
                  <article
                    className="rounded-md border border-gray-200 p-4"
                    key={contact.id}
                  >
                    <form
                      action={updateWhatsAppContactAction}
                      className="grid gap-3 md:grid-cols-2"
                    >
                      <input name="contactId" type="hidden" value={contact.id} />
                      <label className="block">
                        <span className="text-xs font-medium text-gray-600">
                          Nome
                        </span>
                        <input
                          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                          defaultValue={contact.name}
                          name="name"
                          required
                          type="text"
                        />
                      </label>
                      <label className="block">
                        <span className="text-xs font-medium text-gray-600">
                          Telefone
                        </span>
                        <input
                          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                          defaultValue={contact.phone}
                          name="phone"
                          required
                          type="tel"
                        />
                      </label>
                      <label className="block md:col-span-2">
                        <span className="text-xs font-medium text-gray-600">
                          Descricao
                        </span>
                        <input
                          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                          defaultValue={contact.description ?? ""}
                          name="description"
                          type="text"
                        />
                      </label>
                      <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                          className="size-4 accent-emerald-700"
                          defaultChecked={contact.isActive}
                          name="isActive"
                          type="checkbox"
                        />
                        Ativo
                      </label>
                      <button
                        className="rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
                        type="submit"
                      >
                        Editar contato
                      </button>
                    </form>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <form action={deactivateWhatsAppContactAction}>
                        <input name="contactId" type="hidden" value={contact.id} />
                        <ConfirmDialog message="Desativar este contato? Ele deixara de aparecer para novos envios.">
                          <button
                            className="rounded-md border border-amber-200 px-3 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-50"
                            type="submit"
                          >
                            Desativar
                          </button>
                        </ConfirmDialog>
                      </form>
                      <form action={deleteWhatsAppContactAction}>
                        <input name="contactId" type="hidden" value={contact.id} />
                        <ConfirmDialog message="Excluir este contato permanentemente?">
                          <button
                            className="rounded-md border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                            type="submit"
                          >
                            Excluir
                          </button>
                        </ConfirmDialog>
                      </form>
                    </div>
                  </article>
                ))
              ) : (
                <p className="rounded-md border border-dashed border-gray-300 p-6 text-sm text-gray-600">
                  Nenhum contato cadastrado.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-950">
              Logs de compartilhamento
            </h2>
            <div className="mt-5 space-y-4">
              {logs.length > 0 ? (
                logs.map((log) => (
                  <article className="rounded-md border border-gray-200 p-4" key={log.id}>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-semibold text-gray-950">{log.phone}</p>
                        <p className="mt-1 text-sm text-gray-600">
                          {formatDate(log.createdAt)}
                        </p>
                      </div>
                      <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                        {log.status}
                      </span>
                    </div>
                    <p className="mt-3 line-clamp-3 whitespace-pre-line text-sm leading-6 text-gray-700">
                      {log.message}
                    </p>
                  </article>
                ))
              ) : (
                <p className="text-sm text-gray-600">Nenhum log criado ainda.</p>
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
