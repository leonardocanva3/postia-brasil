import type { ReactNode } from "react";
import { AppLogo } from "@/components/app-logo";

type AuthShellProps = Readonly<{
  title: string;
  description: string;
  children: ReactNode;
}>;

export function AuthShell({ title, description, children }: AuthShellProps) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-gray-50 px-4 py-8 sm:px-6">
      <section className="w-full max-w-[460px] rounded-lg border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex justify-center">
          <AppLogo size="md" />
        </div>
        <h1 className="mt-6 text-center text-2xl font-semibold text-gray-950 sm:text-3xl">
          {title}
        </h1>
        <p className="mt-3 text-center text-sm leading-6 text-gray-600">
          {description}
        </p>
        <div className="mt-8">{children}</div>
      </section>
    </main>
  );
}
