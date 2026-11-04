import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { FileText, Trash2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DECISIONS,
  PROSPECT_STAGES,
  RANKS,
  ROAD_TO_GOLD,
  START_RANK,
  WEEKLY_REVIEW,
  cureFollowupDate,
} from "@/lib/business";

export type Contact = Tables<"contacts">;
export type Kind = "prospect" | "client" | "partner";

const empty = (kind: Kind): Partial<Contact> => ({
  kind,
  name: "",
  stage: "Premier contact",
  cure_days: 30,
  rgpd_consent: false,
  rank: START_RANK,
  road_to_gold: [],
  weekly_review: {},
});

const Sel = (p: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select {...p} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" />
);

export function ContactDialog({
  open,
  onOpenChange,
  contact,
  kind = "prospect",
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  contact?: Contact | null;
  kind?: Kind;
}) {
  const qc = useQueryClient();
  const [c, setC] = useState<Partial<Contact>>(empty(kind));
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (open) setC(contact ? { ...contact } : empty(kind));
  }, [open, contact, kind]);

  const set = <K extends keyof Contact>(k: K, v: Contact[K]) => setC((p) => ({ ...p, [k]: v }));
  const k = (c.kind ?? kind) as Kind;
  const road = (c.road_to_gold as number[] | null) ?? [];
  const review = (c.weekly_review as Record<string, string> | null) ?? {};

  async function save() {
    if (!c.name?.trim()) return toast.error("Le nom est obligatoire");
    if (k === "client" && !c.rgpd_consent) return toast.error("Le consentement RGPD est obligatoire pour un client");
    setBusy(true);
    const payload = { ...c, name: c.name.trim() } as Contact;
    const { error } = contact
      ? await supabase.from("contacts").update(payload).eq("id", contact.id)
      : await supabase.from("contacts").insert(payload);
    setBusy(false);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["contacts"] });
    toast.success("Enregistré");
    onOpenChange(false);
  }

  async function remove() {
    if (!contact || !confirm("Supprimer cette fiche ?")) return;
    await supabase.from("contacts").delete().eq("id", contact.id);
    qc.invalidateQueries({ queryKey: ["contacts"] });
    onOpenChange(false);
  }

  async function uploadPdf(file: File) {
    const { data: u } = await supabase.auth.getUser();
    const path = `${u.user!.id}/${crypto.randomUUID()}-${file.name}`;
    const { error } = await supabase.storage.from("scans").upload(path, file, { contentType: "application/pdf" });
    if (error) return toast.error(error.message);
    set("scan_pdf_path", path);
    toast.success("PDF joint — pensez à enregistrer");
  }
  async function openPdf() {
    if (!c.scan_pdf_path) return;
    const { data } = await supabase.storage.from("scans").createSignedUrl(c.scan_pdf_path, 300);
    if (data) window.open(data.signedUrl, "_blank");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-display text-forest">{contact ? c.name : "Nouveau contact"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="col-span-2 space-y-1">
              <Label>Nom</Label>
              <Input value={c.name ?? ""} onChange={(e) => set("name", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Téléphone</Label>
              <Input value={c.phone ?? ""} onChange={(e) => set("phone", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>E-mail</Label>
              <Input value={c.email ?? ""} onChange={(e) => set("email", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Type</Label>
              <Sel value={k} onChange={(e) => set("kind", e.target.value)}>
                <option value="prospect">Prospect</option>
                <option value="client">Client privilégié</option>
                <option value="partner">Partenaire</option>
              </Sel>
            </div>
            <div className="space-y-1">
              <Label>Prochaine relance</Label>
              <Input type="date" value={c.next_followup ?? ""} onChange={(e) => set("next_followup", e.target.value || null)} />
            </div>
          </div>

          {k === "prospect" && (
            <div className="space-y-3 rounded-2xl bg-muted p-3">
              <div className="space-y-1">
                <Label>Étape</Label>
                <Sel value={c.stage ?? ""} onChange={(e) => set("stage", e.target.value)}>
                  {PROSPECT_STAGES.map((s) => <option key={s}>{s}</option>)}
                </Sel>
              </div>
              {c.stage === "Décision" && (
                <div className="space-y-1">
                  <Label>Décision</Label>
                  <Sel value={c.decision ?? ""} onChange={(e) => set("decision", e.target.value || null)}>
                    <option value="">—</option>
                    {DECISIONS.map((s) => <option key={s}>{s}</option>)}
                  </Sel>
                </div>
              )}
              <div className="space-y-1">
                <Label>Analyse de scan (PDF)</Label>
                <div className="flex gap-2">
                  {c.scan_pdf_path ? (
                    <>
                      <Button type="button" variant="outline" size="sm" onClick={openPdf}><FileText className="h-4 w-4" />Voir le PDF</Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => set("scan_pdf_path", null)}>Retirer</Button>
                    </>
                  ) : (
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm">
                      <Upload className="h-4 w-4" /> Joindre un PDF
                      <input type="file" accept="application/pdf" hidden onChange={(e) => e.target.files?.[0] && uploadPdf(e.target.files[0])} />
                    </label>
                  )}
                </div>
              </div>
            </div>
          )}

          {k === "client" && (
            <div className="space-y-3 rounded-2xl bg-muted p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">Client privilégié</p>
              <div className="space-y-1"><Label>Objectifs</Label><Textarea value={c.goals ?? ""} onChange={(e) => set("goals", e.target.value)} /></div>
              <div className="space-y-1"><Label>Produits pris</Label><Input value={c.products ?? ""} onChange={(e) => set("products", e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1"><Label>Date de commande</Label><Input type="date" value={c.order_date ?? ""} onChange={(e) => set("order_date", e.target.value || null)} /></div>
                <div className="space-y-1"><Label>Durée de cure (jours)</Label><Input type="number" value={c.cure_days ?? 30} onChange={(e) => set("cure_days", Number(e.target.value))} /></div>
              </div>
              <p className="text-sm">Relance fin de cure : <strong>{cureFollowupDate(c.order_date ?? null, c.cure_days ?? 30) ?? "—"}</strong></p>
              <label className="flex items-start gap-2 text-sm">
                <Checkbox checked={!!c.rgpd_consent} onCheckedChange={(v) => set("rgpd_consent", !!v)} />
                <span>Le client accepte que ses données soient conservées pour son suivi (RGPD) — <em>obligatoire</em></span>
              </label>
            </div>
          )}

          {k === "partner" && (
            <div className="space-y-3 rounded-2xl bg-muted p-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label>Rang</Label>
                  <Sel value={c.rank ?? START_RANK} onChange={(e) => set("rank", e.target.value)}>
                    <option>{START_RANK}</option>
                    {RANKS.map((r) => <option key={r.name}>{r.name}</option>)}
                  </Sel>
                </div>
                <div className="space-y-1">
                  <Label>Objectif de rang</Label>
                  <Sel value={c.rank_goal ?? ""} onChange={(e) => set("rank_goal", e.target.value || null)}>
                    <option value="">—</option>
                    {RANKS.map((r) => <option key={r.name}>{r.name}</option>)}
                  </Sel>
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold">Route vers l'Or ({road.length}/10)</p>
                {ROAD_TO_GOLD.map((s, i) => (
                  <label key={i} className="flex items-center gap-2 py-1 text-sm">
                    <Checkbox
                      checked={road.includes(i)}
                      onCheckedChange={(v) => set("road_to_gold", v ? [...road, i] : road.filter((x) => x !== i))}
                    />
                    {i + 1}. {s}
                  </label>
                ))}
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold">Revue hebdomadaire</p>
                {WEEKLY_REVIEW.map((q, i) => (
                  <div key={i} className="space-y-1">
                    <Label className="text-xs">{q}</Label>
                    <Input value={review[i] ?? ""} onChange={(e) => set("weekly_review", { ...review, [i]: e.target.value })} />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-1"><Label>Notes</Label><Textarea value={c.notes ?? ""} onChange={(e) => set("notes", e.target.value)} /></div>
          <div className="flex gap-2">
            {contact && <Button variant="ghost" onClick={remove}><Trash2 className="h-4 w-4" /></Button>}
            <Button className="flex-1 rounded-full" onClick={save} disabled={busy}>Enregistrer</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
