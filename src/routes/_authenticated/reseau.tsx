import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Search, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PROSPECT_STAGES, START_RANK, cureFollowupDate, rankColor } from "@/lib/business";
import { PageHeader, meta } from "@/components/app/PageHeader";
import { ContactDialog, type Contact, type Kind } from "@/components/app/ContactDialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/reseau")({
  head: () => meta("Mon réseau", "Vivier de prospects, clients privilégiés et partenaires."),
  component: Network,
});

function Network() {
  const [tab, setTab] = useState<Kind>("prospect");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Contact | null>(null);
  const { data = [] } = useQuery({
    queryKey: ["contacts"],
    queryFn: async () => (await supabase.from("contacts").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  const list = data.filter((c) => c.kind === tab && c.name.toLowerCase().includes(q.toLowerCase()));
  const openC = (c: Contact | null) => { setEditing(c); setOpen(true); };

  return (
    <div>
      <PageHeader
        title="Mon réseau"
        action={<Button className="rounded-full" onClick={() => openC(null)}><Plus className="h-4 w-4" />Ajouter</Button>}
      />
      <Tabs value={tab} onValueChange={(v) => setTab(v as Kind)}>
        <TabsList className="grid w-full grid-cols-3 rounded-full">
          <TabsTrigger value="prospect" className="rounded-full">Vivier</TabsTrigger>
          <TabsTrigger value="client" className="rounded-full">Clients</TabsTrigger>
          <TabsTrigger value="partner" className="rounded-full">Partenaires</TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="relative my-4">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input className="rounded-full pl-9" placeholder="Rechercher…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {tab === "prospect" ? (
        <div className="space-y-4">
          {PROSPECT_STAGES.map((s, i) => {
            const items = list.filter((c) => c.stage === s);
            return (
              <section key={s}>
                <h3 className="mb-2 flex items-center gap-2 font-sans text-sm font-semibold text-muted-foreground">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-leaf-soft text-xs text-primary">{i + 1}</span>
                  {s} <span className="text-xs">({items.length})</span>
                </h3>
                <div className="space-y-2">
                  {items.map((c) => (
                    <Row key={c.id} onClick={() => openC(c)} title={c.name} sub={c.decision ?? c.phone ?? ""} right={c.scan_pdf_path ? <FileText className="h-4 w-4 text-primary" /> : null} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {list.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">Aucune fiche pour le moment.</p>}
          {list.map((c) =>
            tab === "client" ? (
              <Row key={c.id} onClick={() => openC(c)} title={c.name}
                sub={`Client privilégié · relance ${cureFollowupDate(c.order_date, c.cure_days) ?? "—"}`} />
            ) : (
              <Row key={c.id} onClick={() => openC(c)} title={c.name}
                sub={`Route vers l'Or : ${((c.road_to_gold as number[]) ?? []).length}/10${c.rank_goal ? ` · objectif ${c.rank_goal}` : ""}`}
                right={<span className="rounded-full px-2.5 py-1 text-xs font-semibold text-primary-foreground" style={{ background: rankColor(c.rank) }}>{c.rank ?? START_RANK}</span>} />
            ),
          )}
        </div>
      )}
      <ContactDialog open={open} onOpenChange={setOpen} contact={editing} kind={tab} />
    </div>
  );
}

function Row({ title, sub, right, onClick }: { title: string; sub?: string; right?: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className="card-soft flex w-full items-center justify-between gap-3 p-3 text-left">
      <div className="min-w-0">
        <p className="truncate font-semibold">{title}</p>
        {sub && <p className="truncate text-xs text-muted-foreground">{sub}</p>}
      </div>
      {right}
    </button>
  );
}
