import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Flame, Video, UserPlus, StickyNote, Phone, Settings, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMe } from "@/lib/auth";
import { THOUGHTS, computeStreak, cureFollowupDate, todayISO } from "@/lib/business";
import { meta } from "@/components/app/PageHeader";
import { ContactDialog, type Contact } from "@/components/app/ContactDialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/aujourdhui")({
  head: () => meta("Aujourd'hui", "Vos actions du jour, relances et prochain Zoom."),
  component: Today,
});

function Today() {
  const qc = useQueryClient();
  const { data: me } = useMe();
  const today = todayISO();
  const [newAction, setNewAction] = useState("");
  const [contactOpen, setContactOpen] = useState(false);
  const [editing, setEditing] = useState<Contact | null>(null);
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState("");

  const actions = useQuery({
    queryKey: ["actions"],
    queryFn: async () => (await supabase.from("daily_actions").select("*").order("created_at").limit(1000)).data ?? [],
  });
  const contacts = useQuery({
    queryKey: ["contacts"],
    queryFn: async () => (await supabase.from("contacts").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  const zoom = useQuery({
    queryKey: ["events", "next"],
    queryFn: async () =>
      (await supabase.from("events").select("*").gte("starts_at", new Date().toISOString()).order("starts_at").limit(1)).data?.[0] ?? null,
  });

  const todays = (actions.data ?? []).filter((a) => a.day === today);
  const streak = computeStreak(actions.data ?? [], today);
  const followups = (contacts.data ?? []).filter(
    (c) => c.next_followup === today || (c.kind === "client" && cureFollowupDate(c.order_date, c.cure_days) === today),
  );
  const thought = THOUGHTS[new Date().getDate() % THOUGHTS.length];

  async function addAction() {
    if (!newAction.trim() || todays.length >= 3) return;
    await supabase.from("daily_actions").insert({ label: newAction.trim(), day: today });
    setNewAction("");
    qc.invalidateQueries({ queryKey: ["actions"] });
  }
  async function toggle(id: string, done: boolean) {
    await supabase.from("daily_actions").update({ done }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["actions"] });
  }
  async function saveNote() {
    if (!note.trim()) return;
    await supabase.from("notes").insert({ content: note.trim() });
    setNote("");
    setNoteOpen(false);
    qc.invalidateQueries({ queryKey: ["notes"] });
    toast.success("Note enregistrée");
  }

  return (
    <div className="space-y-4">
      <section className="relative overflow-hidden rounded-3xl bg-hero p-6 text-primary-foreground shadow-soft">
        <Link to="/reglages" className="absolute right-4 top-4 opacity-80 md:hidden" aria-label="Réglages"><Settings className="h-5 w-5" /></Link>
        <p className="text-sm opacity-90">Vivez une vie abondante</p>
        <h1 className="mt-1 text-3xl font-semibold">Bonjour {me?.firstName ?? ""} 🌿</h1>
        <p className="mt-4 rounded-2xl bg-primary-foreground/15 p-3 text-sm italic">« {thought} »</p>
      </section>

      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => { setEditing(null); setContactOpen(true); }} className="card-soft flex items-center gap-2 text-sm font-medium text-primary">
          <UserPlus className="h-5 w-5" /> Ajouter un contact
        </button>
        <button onClick={() => setNoteOpen(true)} className="card-soft flex items-center gap-2 text-sm font-medium text-primary">
          <StickyNote className="h-5 w-5" /> Note rapide
        </button>
      </div>

      <section className="card-soft">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Mes 3 actions du jour</h2>
          <span className="flex items-center gap-1 rounded-full bg-leaf-soft px-3 py-1 text-sm font-semibold text-primary">
            <Flame className="h-4 w-4" /> {streak} j
          </span>
        </div>
        <ul className="space-y-2">
          {todays.map((a) => (
            <li key={a.id} className="flex items-center gap-3 rounded-xl bg-muted px-3 py-2.5">
              <Checkbox checked={a.done} onCheckedChange={(v) => toggle(a.id, !!v)} />
              <span className={a.done ? "text-muted-foreground line-through" : ""}>{a.label}</span>
            </li>
          ))}
        </ul>
        {todays.length < 3 && (
          <div className="mt-2 flex gap-2">
            <Input placeholder="Nouvelle action…" value={newAction} onChange={(e) => setNewAction(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addAction()} />
            <Button size="icon" onClick={addAction}><Plus className="h-4 w-4" /></Button>
          </div>
        )}
      </section>

      <section className="card-soft">
        <h2 className="mb-3 text-lg font-semibold">Relances prévues aujourd'hui</h2>
        {followups.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune relance aujourd'hui.</p>
        ) : (
          <ul className="space-y-2">
            {followups.map((c) => (
              <li key={c.id}>
                <button onClick={() => { setEditing(c); setContactOpen(true); }} className="flex w-full items-center justify-between rounded-xl bg-muted px-3 py-2.5 text-left">
                  <span className="font-medium">{c.name}</span>
                  {c.phone && <a href={`tel:${c.phone}`} onClick={(e) => e.stopPropagation()} className="text-primary"><Phone className="h-4 w-4" /></a>}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card-soft flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-leaf-soft text-primary"><Video className="h-6 w-6" /></div>
        <div className="flex-1">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Prochain Zoom / RDV</p>
          {zoom.data ? (
            <>
              <p className="font-semibold">{zoom.data.title}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(zoom.data.starts_at).toLocaleString("fr-FR", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Rien de prévu</p>
          )}
        </div>
        {zoom.data?.link && <Button asChild size="sm" className="rounded-full"><a href={zoom.data.link} target="_blank" rel="noreferrer">Rejoindre</a></Button>}
      </section>

      <ContactDialog open={contactOpen} onOpenChange={setContactOpen} contact={editing} />
      <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader><DialogTitle>Note rapide</DialogTitle></DialogHeader>
          <Textarea rows={5} value={note} onChange={(e) => setNote(e.target.value)} autoFocus />
          <Button className="rounded-full" onClick={saveNote}>Enregistrer</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
