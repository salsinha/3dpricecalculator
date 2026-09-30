"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Logo from "@/components/Logo";
import { isSupabaseConfigured } from "@/lib/env";
import { toUserMessage } from "@/lib/errors";
import { validateLogin } from "@/lib/validation";
import { createClient } from "@/lib/supabase/client";
import { signIn } from "@/services/auth";

export default function LoginForm() {
  const router = useRouter();
  const configured = isSupabaseConfigured();
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const result = validateLogin(values);
    setErrors(result.errors);
    setFormError("");
    if (!result.ok) return;

    setSubmitting(true);
    try {
      await signIn(createClient(), result.value.email, result.value.password);
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setFormError(toUserMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="flex flex-col gap-8 bg-sidebar px-6 py-8 text-white lg:min-h-screen lg:justify-between lg:gap-0 lg:px-12 lg:py-12">
        <div className="flex items-center gap-4">
          <Logo className="h-28 w-auto" />
          <div>
            <p className="text-sm font-semibold">3D J.A.</p>
            <p className="text-xs tracking-wide text-white/55 uppercase">Create & Print Studio</p>
          </div>
        </div>
        <div className="max-w-md lg:mt-10">
          <p className="text-sm font-medium text-accent">Price Calculator</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Preços de peças impressas em 3D
          </h1>
          <p className="mt-4 text-sm leading-6 text-white/65">
            Filamentos, tempo de máquina, mão de obra e margem sobre o preço de venda.
          </p>
        </div>
        <p className="text-xs text-white/40 lg:mt-10">Acesso reservado à equipa.</p>
      </section>

      <section className="flex items-center justify-center bg-paper px-6 py-12">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-semibold text-ink">Entrar</h2>
          <p className="mt-2 text-sm text-muted">Utilize a conta criada no Supabase.</p>

          {configured ? (
            <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
              <Input
                label="Email"
                name="email"
                type="email"
                autoComplete="email"
                value={values.email}
                onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))}
                error={errors.email}
                autoFocus
              />
              <Input
                label="Palavra-passe"
                name="password"
                type="password"
                autoComplete="current-password"
                value={values.password}
                onChange={(event) => setValues((current) => ({ ...current, password: event.target.value }))}
                error={errors.password}
              />
              {formError ? <p className="text-sm text-red-600">{formError}</p> : null}
              <Button type="submit" loading={submitting} className="w-full">
                Entrar
              </Button>
            </form>
          ) : (
            <div className="mt-8 space-y-3 rounded-2xl border border-line bg-white p-5 text-sm leading-6 text-muted">
              <p className="font-medium text-ink">Supabase ainda não está configurado.</p>
              <ol className="list-decimal space-y-2 pl-4">
                <li>Crie um projeto no Supabase.</li>
                <li>Execute o ficheiro supabase/migrations/001_init.sql no SQL Editor.</li>
                <li>Copie `.env.example` para `.env.local` e preencha o URL e a chave anon.</li>
                <li>Reinicie `npm run dev`.</li>
              </ol>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
