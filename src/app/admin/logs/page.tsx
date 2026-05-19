import { formatDate } from "@/lib/admin/format";
import { prisma } from "@/lib/database/prisma";

export const dynamic = "force-dynamic";

function formatMetadata(metadata: unknown) {
  if (!metadata) {
    return "-";
  }

  return JSON.stringify(metadata);
}

export default async function AdminLogsPage() {
  const logs = await prisma.adminLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: true
    }
  });

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col px-6 py-8">
      <h1 className="text-3xl font-semibold text-gray-950">Logs</h1>
      <section className="mt-8 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr_2fr_1fr] gap-4 border-b border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700">
          <span>Usuario</span>
          <span>Acao</span>
          <span>Entidade</span>
          <span>ID</span>
          <span>Metadata</span>
          <span>Data</span>
        </div>
        {logs.map((log) => (
          <div
            className="grid grid-cols-[1.4fr_1fr_1fr_1fr_2fr_1fr] gap-4 border-b border-gray-100 px-5 py-4 text-sm text-gray-700 last:border-b-0"
            key={log.id}
          >
            <span className="font-medium text-gray-950">{log.user.email}</span>
            <span>{log.action}</span>
            <span>{log.entity}</span>
            <span>{log.entityId ?? "-"}</span>
            <span className="truncate">{formatMetadata(log.metadata)}</span>
            <span>{formatDate(log.createdAt)}</span>
          </div>
        ))}
      </section>
    </main>
  );
}
