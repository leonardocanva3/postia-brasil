import type { ReactNode } from "react";

type AuthShellProps = Readonly<{
  title: string;
  description: string;
  children: ReactNode;
}>;

export function AuthShell({ title, description, children }: AuthShellProps) {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <section className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
          PostIA Brasil
        </p>
        <h1 className="mt-4 text-3xl font-semibold text-gray-950">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-gray-600">{description}</p>
        <div className="mt-8">{children}</div>
      </section>
    </main>
  );
}
