import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-6">
      <div className="text-center">
        <p className="text-sm font-medium text-accent">404</p>
        <h1 className="mt-2 text-2xl font-semibold text-ink">Página não encontrada</h1>
        <Link href="/dashboard" className="mt-4 inline-block text-sm font-medium text-accent">
          Voltar ao painel
        </Link>
      </div>
    </main>
  );
}
