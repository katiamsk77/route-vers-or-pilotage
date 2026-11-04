import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Copy, Download, Plus, Trash2, ExternalLink, Video, CalendarDays } from "lucide-react";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import { useMe } from "@/lib/auth";
import { cureFollowupDate } from "@/lib/business";
import { PageHeader, meta } from "@/components/app/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/_authenticated/outils")({
  head: () => meta("Outils", "Scripts, présentations, visuels, objectifs, agenda, notes et to-do."),
  component: Tools,
});

const useList = <T,>(key: string, fn: () => PromiseLike<{ data: T[] | null }>) =>
  useQuery({ queryKey: [key], queryFn: async () => (await fn()).data ?? [] });

function Tools() {
  return (
    <div>
      <PageHeader title="Outils" />
      <Tabs defaultValue="scripts">
        <TabsList className="mb-4 flex h-auto w-full flex-wrap justify-start gap-1 rounded-2xl bg-muted p-1">
          {[["scripts", "Scripts"], ["presentations", "Présentations"], ["visuels", "Visuels"], ["objectifs", "Objectifs"], ["agenda", "Agenda"], ["notes", "Notes"], ["todo", "To-do"], ["export", "Export"]].map(([v, l]) => (
            <TabsTrigger key={v} value={v!} className="rounded-xl">{l}</TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="scripts"><Scripts /></TabsContent>
        <TabsContent value="presentations"><Resources kind="presentation" /></TabsContent>
        <TabsContent value="visuels"><Resources kind="visuel" /></TabsContent>
        <TabsContent value="objectifs"><Goals /></TabsContent>
        <TabsContent value="agenda"><Agenda /></TabsContent>
        <TabsContent value="notes"><Notes /></TabsContent>
        <TabsContent value="todo"><Todos /></TabsContent>
        <TabsContent value="export"><Export /></TabsContent>
      </Tabs>
    </div>
  );
}

function Scripts() {
  const { data: me } = useMe();
  const qc = useQueryClient();
  const { data = [] } = useList("scripts", () => supabase.from("scripts").select("*").order("category"));
  const [t, setT] = useState(""); const [c, setC] = useState(""); const [cat, setCat] = useState("Prospection");
  async function add() {
    if (!t || !c) return;
    const { error } = await supabase.from("scripts").insert({ title: t, content: c, category: cat });
    if (error) { toast.error(error.message); return; }
    setT(""); setC(""); qc.invalidateQueries({ queryKey: ["scripts"] });
  }
  return (
    <div className="space-y-3">
      {data.map((s) => (
        <div key={s.id} className="card-soft">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div><p className="font-semibold">{s.title}</p><p className="text-xs text-muted-foreground">{s.category}</p></div>
            <div className="flex gap-1">
              <Button size="sm" className="rounded-full" onClick={() => { navigator.clipboard.writeText(s.content); toast.success("Script copié"); }}><Copy className="h-4 w-4" />Copier</Button>
              {me?.isAdmin && <Button size="icon" variant="ghost" onClick={async () => { await supabase.from("scripts").delete().eq("id", s.id); qc.invalidateQueries({ queryKey: ["scripts"] }); }}><Trash2 className="h-4 w-4" /></Button>}
            </div>
          </div>
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">{s.content}</p>
        </div>
      ))}
      {me?.isAdmin && (
        <div className="card-soft space-y-2 border-dashed">
          <p className="text-sm font-semibold">Ajouter un script</p>
          <div className="grid grid-cols-2 gap-2"><Input placeholder="Titre" value={t} onChange={(e) => setT(e.target.value)} /><Input placeholder="Catégorie" value={cat} onChange={(e) => setCat(e.target.value)} /></div>
          <Textarea placeholder="Texte du script" value={c} onChange={(e) => setC(e.target.value)} />
          <Button className="rounded-full" onClick={add}>Ajouter</Button>
        </div>
      )}
    </div>
  );
}

function Resources({ kind }: { kind: "presentation" | "visuel" }) {
  const { data: me } = useMe();
  const qc = useQueryClient();
  const { data = [] } = useList("resources", () => supabase.from("resources").select("*").order("created_at", { ascending: false }));
  const items = data.filter((r) => r.kind === kind);
  const [t, setT] = useState(""); const [u, setU] = useState("");
  async function add() {
    if (!t || !u) return;
    const { error } = await supabase.from("resources").insert({ title: t, url: u, kind });
    if (error) { toast.error(error.message); return; }
    setT(""); setU(""); qc.invalidateQueries({ queryKey: ["resources"] });
  }
  async function share(title: string, url: string) {
    if (navigator.share) await navigator.share({ title, url }).catch(() => {});
    else { await navigator.clipboard.writeText(url); toast.success("Lien copié"); }
  }
  return (
    <div className="space-y-3">
      {items.length === 0 && <p className="text-sm text-muted-foreground">Rien pour le moment.</p>}
      <div className={kind === "visuel" ? "grid grid-cols-2 gap-3 md:grid-cols-3" : "space-y-2"}>
        {items.map((r) => (
          <div key={r.id} className="card-soft p-3">
            {kind === "visuel" && <img src={r.url} alt={r.title} loading="lazy" className="mb-2 aspect-square w-full rounded-xl object-cover" />}
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-semibold">{r.title}</p>
              <div className="flex">
                <Button size="icon" variant="ghost" onClick={() => share(r.title, r.url)}><ExternalLink className="h-4 w-4" /></Button>
                {me?.isAdmin && <Button size="icon" variant="ghost" onClick={async () => { await supabase.from("resources").delete().eq("id", r.id); qc.invalidateQueries({ queryKey: ["resources"] }); }}><Trash2 className="h-4 w-4" /></Button>}
              </div>
            </div>
          </div>
        ))}
      </div>
      {me?.isAdmin && (
        <div className="card-soft flex flex-col gap-2 border-dashed md:flex-row">
          <Input placeholder="Titre" value={t} onChange={(e) => setT(e.target.value)} />
          <Input placeholder={kind === "visuel" ? "Lien de l'image" : "Lien de la présentation"} value={u} onChange={(e) => setU(e.target.value)} />
          <Button className="rounded-full" onClick={add}><Plus className="h-4 w-4" />Ajouter</Button>
        </div>
      )}
    </div>
  );
}

function Goals() {
  const qc = useQueryClient();
  const month = new Date().toISOString().slice(0, 7);
  const { data = [] } = useList("goals", () => supabase.from("monthly_goals").select("*").eq("month", month).order("created_at"));
  const [l, setL] = useState(""); const [p, setP] = useState("");
  const refresh = () => qc.invalidateQueries({ queryKey: ["goals"] });
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">Objectifs de {new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}</p>
      {data.map((g) => (
        <div key={g.id} className="card-soft flex items-center gap-3 p-3">
          <div className="flex-1">
            <p className="font-semibold">{g.label}</p>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary" style={{ width: `${Math.min(100, g.planned ? (g.done / g.planned) * 100 : 0)}%` }} /></div>
          </div>
          <Input type="number" className="w-16" value={g.done} onChange={async (e) => { await supabase.from("monthly_goals").update({ done: Number(e.target.value) }).eq("id", g.id); refresh(); }} />
          <span className="text-sm text-muted-foreground">/ {g.planned}</span>
          <Button size="icon" variant="ghost" onClick={async () => { await supabase.from("monthly_goals").delete().eq("id", g.id); refresh(); }}><Trash2 className="h-4 w-4" /></Button>
        </div>
      ))}
      <div className="flex gap-2">
        <Input placeholder="Ex. : nouveaux clients" value={l} onChange={(e) => setL(e.target.value)} />
        <Input type="number" placeholder="Prévu" className="w-24" value={p} onChange={(e) => setP(e.target.value)} />
        <Button size="icon" onClick={async () => { if (!l) return; await supabase.from("monthly_goals").insert({ label: l, planned: Number(p) || 0, month }); setL(""); setP(""); refresh(); }}><Plus className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}

function Agenda() {
  const { data: me } = useMe();
  const qc = useQueryClient();
  const { data = [] } = useList("events", () => supabase.from("events").select("*").gte("starts_at", new Date(Date.now() - 864e5).toISOString()).order("starts_at"));
  const [t, setT] = useState(""); const [d, setD] = useState(""); const [k, setK] = useState("RDV"); const [link, setLink] = useState(""); const [team, setTeam] = useState(false);
  const refresh = () => qc.invalidateQueries({ queryKey: ["events"] });
  async function add() {
    if (!t || !d) { toast.error("Titre et date requis"); return; }
    const { error } = await supabase.from("events").insert({ title: t, starts_at: new Date(d).toISOString(), kind: k, link: link || null, user_id: team ? null : (me?.id ?? null) });
    if (error) { toast.error(error.message); return; }
    setT(""); setD(""); setLink(""); refresh();
  }
  return (
    <div className="space-y-2">
      {data.map((e) => (
        <div key={e.id} className="card-soft flex items-center gap-3 p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-leaf-soft text-primary">{e.kind === "Zoom" ? <Video className="h-5 w-5" /> : <CalendarDays className="h-5 w-5" />}</div>
          <div className="flex-1">
            <p className="font-semibold">{e.title} {!e.user_id && <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-[10px] text-primary-foreground">Équipe</span>}</p>
            <p className="text-xs text-muted-foreground">{new Date(e.starts_at).toLocaleString("fr-FR", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
          </div>
          {e.link && <a href={e.link} target="_blank" rel="noreferrer" className="text-primary"><ExternalLink className="h-4 w-4" /></a>}
          {(e.user_id || me?.isAdmin) && <Button size="icon" variant="ghost" onClick={async () => { await supabase.from("events").delete().eq("id", e.id); refresh(); }}><Trash2 className="h-4 w-4" /></Button>}
        </div>
      ))}
      <div className="card-soft space-y-2 border-dashed">
        <div className="grid grid-cols-2 gap-2">
          <Input placeholder="Titre" value={t} onChange={(e) => setT(e.target.value)} />
          <Input type="datetime-local" value={d} onChange={(e) => setD(e.target.value)} />
          <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={k} onChange={(e) => setK(e.target.value)}><option>RDV</option><option>Zoom</option></select>
          <Input placeholder="Lien (optionnel)" value={link} onChange={(e) => setLink(e.target.value)} />
        </div>
        {me?.isAdmin && <label className="flex items-center gap-2 text-sm"><Checkbox checked={team} onCheckedChange={(v) => setTeam(!!v)} />Visible par toute l'équipe</label>}
        <Button className="rounded-full" onClick={add}><Plus className="h-4 w-4" />Ajouter</Button>
      </div>
    </div>
  );
}

function Notes() {
  const qc = useQueryClient();
  const { data = [] } = useList("notes", () => supabase.from("notes").select("*").order("created_at", { ascending: false }));
  const [n, setN] = useState("");
  const refresh = () => qc.invalidateQueries({ queryKey: ["notes"] });
  return (
    <div className="space-y-2">
      <Textarea placeholder="Nouvelle note…" value={n} onChange={(e) => setN(e.target.value)} />
      <Button className="rounded-full" onClick={async () => { if (!n.trim()) return; await supabase.from("notes").insert({ content: n.trim() }); setN(""); refresh(); }}>Enregistrer</Button>
      {data.map((x) => (
        <div key={x.id} className="card-soft flex gap-2 p-3">
          <div className="flex-1"><p className="whitespace-pre-wrap text-sm">{x.content}</p><p className="mt-1 text-xs text-muted-foreground">{new Date(x.created_at).toLocaleDateString("fr-FR")}</p></div>
          <Button size="icon" variant="ghost" onClick={async () => { await supabase.from("notes").delete().eq("id", x.id); refresh(); }}><Trash2 className="h-4 w-4" /></Button>
        </div>
      ))}
    </div>
  );
}

function Todos() {
  const qc = useQueryClient();
  const { data = [] } = useList("todos", () => supabase.from("todos").select("*").order("done").order("created_at"));
  const [l, setL] = useState("");
  const refresh = () => qc.invalidateQueries({ queryKey: ["todos"] });
  const add = async () => { if (!l.trim()) return; await supabase.from("todos").insert({ label: l.trim() }); setL(""); refresh(); };
  return (
    <div className="space-y-2">
      <div className="flex gap-2"><Input placeholder="À faire…" value={l} onChange={(e) => setL(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} /><Button size="icon" onClick={add}><Plus className="h-4 w-4" /></Button></div>
      {data.map((x) => (
        <div key={x.id} className="flex items-center gap-3 rounded-xl bg-muted px-3 py-2.5">
          <Checkbox checked={x.done} onCheckedChange={async (v) => { await supabase.from("todos").update({ done: !!v }).eq("id", x.id); refresh(); }} />
          <span className={`flex-1 ${x.done ? "text-muted-foreground line-through" : ""}`}>{x.label}</span>
          <Button size="icon" variant="ghost" onClick={async () => { await supabase.from("todos").delete().eq("id", x.id); refresh(); }}><Trash2 className="h-4 w-4" /></Button>
        </div>
      ))}
    </div>
  );
}

function Export() {
  async function run() {
    const [c, n, t, g] = await Promise.all([
      supabase.from("contacts").select("*"),
      supabase.from("notes").select("*"),
      supabase.from("todos").select("*"),
      supabase.from("monthly_goals").select("*"),
    ]);
    const kindLabel: Record<string, string> = { prospect: "Prospect", client: "Client privilégié", partner: "Partenaire" };
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet((c.data ?? []).map((x) => ({
      Nom: x.name, Type: kindLabel[x.kind] ?? x.kind, Téléphone: x.phone, "E-mail": x.email, Étape: x.stage, Décision: x.decision,
      Objectifs: x.goals, Produits: x.products, "Date commande": x.order_date, "Relance fin de cure": cureFollowupDate(x.order_date, x.cure_days),
      RGPD: x.rgpd_consent ? "Oui" : "Non", Rang: x.rank, "Objectif de rang": x.rank_goal, "Prochaine relance": x.next_followup, Notes: x.notes,
    }))), "Contacts");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet((n.data ?? []).map((x) => ({ Date: x.created_at.slice(0, 10), Note: x.content }))), "Notes");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet((t.data ?? []).map((x) => ({ Tâche: x.label, Fait: x.done ? "Oui" : "Non" }))), "To-do");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet((g.data ?? []).map((x) => ({ Mois: x.month, Objectif: x.label, Prévu: x.planned, Fait: x.done }))), "Objectifs");
    XLSX.writeFile(wb, `myvitalhealth-${new Date().toISOString().slice(0, 10)}.xlsx`);
  }
  return (
    <div className="card-soft space-y-3 text-center">
      <p className="text-sm text-muted-foreground">Téléchargez toutes vos données (contacts, notes, to-do, objectifs) dans un fichier Excel.</p>
      <Button className="rounded-full" onClick={run}><Download className="h-4 w-4" />Exporter en Excel</Button>
    </div>
  );
}
