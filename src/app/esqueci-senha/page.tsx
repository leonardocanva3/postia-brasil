import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";

export default function EsqueciSenhaPage() {
  return (
    <AuthShell
      title="Recuperar senha"
      description="Informe seu e-mail para iniciar o fluxo de recuperacao de acesso."
    >
      <form className="space-y-5">
        <label className="block">
          <span className="text-sm font-medium text-gray-800">E-mail</span>
          <input
            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            name="email"
            placeholder="voce@empresa.com.br"
            type="email"
          />
        </label>
        <button
          className="w-full rounded-md bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
          type="button"
        >
          Enviar instrucao
        </button>
        <p className="text-center text-sm text-gray-600">
          Lembrou a senha?{" "}
          <Link className="font-medium text-emerald-700 hover:text-emerald-800" href="/login">
            Voltar para login
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
