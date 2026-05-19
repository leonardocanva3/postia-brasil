"use client";

import { useFormStatus } from "react-dom";

type LoadingButtonProps = Readonly<{
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
}>;

export function LoadingButton({
  children,
  loadingText = "Processando...",
  className = ""
}: LoadingButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      className={`rounded-md bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-gray-400 ${className}`}
      disabled={pending}
      type="submit"
    >
      {pending ? loadingText : children}
    </button>
  );
}
