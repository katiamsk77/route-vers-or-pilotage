import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Nouveau mot de passe — myvitalhealth" },
      { name: "description", content: "Choisissez un nouveau mot de passe." },
      { property: "og:title", content: "Nouveau mot de passe — myvitalhealth" },
      { property: "og:description", content: "Choisissez un nouveau mot de passe." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Reset,
});

function Reset() {
  const [pw, setPw] = useState("");
  const navigate = useNavigate();
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ password: pw });
    if (error) return toast.error(error.message);
    toast.success("Mot de passe mis à jour");
    navigate({ to: "/aujourdhui" });
  }
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <form onSubmit={submit} className="card-soft w-full max-w-sm space-y-4 p-6">
        <h1 className="text-2xl font-semibold text-forest">Nouveau mot de passe</h1>
        <Input type="password" minLength={6} required value={pw} onChange={(e) => setPw(e.target.value)} />
        <Button type="submit" className="w-full rounded-full">Enregistrer</Button>
      </form>
    </main>
  );
}
