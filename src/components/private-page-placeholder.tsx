type PrivatePagePlaceholderProps = Readonly<{
  title: string;
}>;

export function PrivatePagePlaceholder({ title }: PrivatePagePlaceholderProps) {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col px-6 py-8">
      <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
        PostIA Brasil
      </p>
      <h1 className="mt-2 text-3xl font-semibold text-gray-950">{title}</h1>
      <section className="mt-8 rounded-lg border border-dashed border-gray-300 bg-white p-6">
        <p className="text-sm text-gray-600">Modulo reservado para a proxima fase.</p>
      </section>
    </main>
  );
}
