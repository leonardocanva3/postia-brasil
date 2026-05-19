import { formatCurrency, formatDate } from "@/lib/admin/format";
import { prisma } from "@/lib/database/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPagamentosPage() {
  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      company: true
    }
  });

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col px-6 py-8">
      <h1 className="text-3xl font-semibold text-gray-950">Pagamentos</h1>
      <section className="mt-8 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr_1.6fr_1fr] gap-4 border-b border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700">
          <span>Empresa</span>
          <span>Valor</span>
          <span>Status</span>
          <span>Metodo</span>
          <span>Referencia externa</span>
          <span>Data</span>
        </div>
        {payments.map((payment) => (
          <div
            className="grid grid-cols-[1.4fr_1fr_1fr_1fr_1.6fr_1fr] gap-4 border-b border-gray-100 px-5 py-4 text-sm text-gray-700 last:border-b-0"
            key={payment.id}
          >
            <span className="font-medium text-gray-950">
              {payment.company.name}
            </span>
            <span>{formatCurrency(payment.amount)}</span>
            <span>{payment.status}</span>
            <span>{payment.paymentMethod}</span>
            <span>{payment.externalReference}</span>
            <span>{formatDate(payment.createdAt)}</span>
          </div>
        ))}
      </section>
    </main>
  );
}
