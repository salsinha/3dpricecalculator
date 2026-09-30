"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Select from "@/components/Select";
import { useToast } from "@/components/Toast";
import { toUserMessage } from "@/lib/errors";
import { formatRate } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import { setActiveElectricityProfile } from "@/services/settings";

export default function ElectricityProfileSelect({ profiles, onChange }) {
  const router = useRouter();
  const toast = useToast();
  const active = profiles.find((profile) => profile.isDefault) || profiles[0];
  const [profileId, setProfileId] = useState(active?.id || "");
  const [saving, setSaving] = useState(false);
  const selected = profiles.find((profile) => profile.id === profileId) || active;

  if (!profiles.length) return null;

  async function handleChange(event) {
    const id = event.target.value;
    const next = profiles.find((profile) => profile.id === id);
    setProfileId(id);
    onChange?.(next);
    setSaving(true);
    try {
      await setActiveElectricityProfile(createClient(), id);
      router.refresh();
    } catch (error) {
      toast.error(toUserMessage(error));
      setProfileId(active?.id || "");
      onChange?.(active);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Select
      label="Perfil de eletricidade"
      name="electricity-profile"
      value={selected?.id || ""}
      onChange={handleChange}
      disabled={saving}
      hint={selected ? `${formatRate(selected.pricePerKwh)} €/kWh nesta casa` : ""}
      options={profiles.map((profile) => ({
        value: profile.id,
        label: `${profile.name} · ${formatRate(profile.pricePerKwh)} €/kWh`,
      }))}
    />
  );
}
