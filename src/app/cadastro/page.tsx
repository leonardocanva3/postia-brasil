import Link from "next/link";
import { registerAction } from "@/app/(auth)/actions";
import { AuthShell } from "@/components/auth-shell";

export default function CadastroPage() {
  return (
    <AuthShell
      title="Criar conta"
      description="Cadastre sua empresa para comecar a organizar posts, legendas e calendario editorial."
    >
      <form action={registerAction} className="space-y-5">
        <label className="block">
          <span className="text-sm font-medium text-gray-800">Nome da empresa</span>
          <input
            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            name="companyName"
            placeholder="PostIA Brasil"
            required
            type="text"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-800">Nome</span>
          <input
            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            name="name"
            placeholder="Seu nome"
            required
            type="text"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-800">E-mail</span>
          <input
            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            name="email"
            placeholder="voce@empresa.com.br"
            required
            type="email"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-800">Senha</span>
          <input
            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            minLength={8}
            name="password"
            placeholder="Minimo de 8 caracteres"
            required
            type="password"
          />
        </label>
        <button
          className="w-full rounded-md bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
          type="submit"
        >
          Criar conta
        </button>
        <p className="text-center text-sm text-gray-600">
          Ja tem conta?{" "}
          <Link className="font-medium text-emerald-700 hover:text-emerald-800" href="/login">
            Entrar
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
