"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import { useToast } from "@/components/Toast";
import { toUserMessage } from "@/lib/errors";
import { createClient } from "@/lib/supabase/client";
import { loadExampleData } from "@/services/seed";

export default function SeedButton({ variant = "secondary" }) {
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const router = useRouter();

  async function onClick() {
    setLoading(true);
    try {
      const result = await loadExampleData(createClient());
      toast.success(
        result.added
          ? "Dados de exemplo carregados."
          : "Os dados de exemplo já estão nesta conta.",
      );
      router.refresh();
    } catch (error) {
      toast.error(toUserMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant={variant} onClick={onClick} loading={loading}>
      Carregar dados de exemplo
    </Button>
  );
}
