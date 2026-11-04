import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useMe } from "@/lib/auth";
import { PageHeader, meta } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/reglages")({
  head: () => meta("Réglages", "Prénom, devise et compte."),
  component: SettingsPage,
});

function SettingsPage() {
  const { data: me } = useMe();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [currency, setCurrency] = useState("USD");
  useEffect(() => { if (me) { setFirstName(me.firstName); setCurrency(me.currency); } }, [me]);

  async function save() {
    if (!me) return;
    const { error } = await supabase.from("profiles").update({ first_name: firstName, currency }).eq("id", me.id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["me"] });
    toast.success("Réglages enregistrés");
  }
  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Réglages" subtitle={me?.email} />
      <section className="card-soft space-y-3">
        <div className="space-y-1"><Label>Prénom</Label><Input value={firstName} onChange={(e) => setFirstName(e.target.value)} /></div>
        <div className="space-y-1">
          <Label>Devise d'affichage</Label>
          <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={currency} onChange={(e) => setCurrency(e.target.value)}>
            <option value="USD">Dollar ($)</option>
            <option value="EUR">Euro (€)</option>
          </select>
        </div>
        <Button className="rounded-full" onClick={save}>Enregistrer</Button>
      </section>
      {me?.isAdmin && <p className="rounded-2xl bg-leaf-soft p-3 text-sm text-primary">Vous êtes administratrice : vous pouvez modifier le catalogue, les scripts, les présentations, les visuels et l'agenda d'équipe.</p>}
      <Button variant="outline" className="w-full rounded-full" onClick={signOut}>Se déconnecter</Button>
    </div>
  );
}
