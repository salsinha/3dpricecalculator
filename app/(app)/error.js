"use client";

import Button from "@/components/Button";

export default function Error({ reset }) {
  return (
    <div className="rounded-2xl border border-line bg-white px-6 py-14 text-center">
      <h2 className="text-lg font-semibold text-ink">Ocorreu um erro</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">
        Não foi possível mostrar esta página. Tente novamente.
      </p>
      <div className="mt-5">
        <Button onClick={() => reset()}>Tentar novamente</Button>
      </div>
    </div>
  );
}
