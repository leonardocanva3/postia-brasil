import Link from "next/link";
import { loginAction } from "@/app/(auth)/actions";
import { AuthShell } from "@/components/auth-shell";

export default function LoginPage() {
  return (
    <AuthShell
      title="Entrar"
      description="Acesse sua area de trabalho para planejar conteudos com IA."
    >
      <form action={loginAction} className="space-y-5">
        <label className="block">
          <span className="text-sm font-medium text-gray-800">E-mail</span>
          <input
            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            name="email"
            placeholder="voce@empresa.com.br"
            type="email"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-800">Senha</span>
          <input
            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            name="password"
            placeholder="Sua senha"
            required
            type="password"
          />
        </label>
        <div className="flex items-center justify-between gap-4 text-sm">
          <Link className="font-medium text-emerald-700 hover:text-emerald-800" href="/esqueci-senha">
            Esqueci minha senha
          </Link>
          <Link className="font-medium text-gray-700 hover:text-gray-950" href="/cadastro">
            Criar conta
          </Link>
        </div>
        <button
          className="w-full rounded-md bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
          type="submit"
        >
          Entrar
        </button>
      </form>
    </AuthShell>
  );
}
