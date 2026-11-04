import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Award, CheckCircle2, Circle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { RANKS, TRAINING_STEPS } from "@/lib/business";
import { PageHeader, meta } from "@/components/app/PageHeader";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_authenticated/apprendre")({
  head: () => meta("Apprendre", "Parcours de démarrage et plan de rémunération Vital Health."),
  component: Learn,
});

const BADGES = [
  { at: 1, label: "Premier pas" },
  { at: 4, label: "Bien lancé(e)" },
  { at: 7, label: "Prêt(e) à rayonner" },
];

function Learn() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["training"],
    queryFn: async () => (await supabase.from("training_progress").select("step_key")).data ?? [],
  });
  const done = new Set(data.map((d) => d.step_key));
  const pct = Math.round((done.size / TRAINING_STEPS.length) * 100);

  async function toggle(key: string) {
    if (done.has(key)) await supabase.from("training_progress").delete().eq("step_key", key);
    else await supabase.from("training_progress").insert({ step_key: key });
    qc.invalidateQueries({ queryKey: ["training"] });
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Apprendre" subtitle="Votre parcours de démarrage" />
      <section className="card-soft">
        <div className="mb-2 flex justify-between text-sm"><span className="font-semibold">Progression</span><span>{pct} %</span></div>
        <Progress value={pct} className="h-3" />
        <div className="mt-4 flex flex-wrap gap-2">
          {BADGES.map((b) => {
            const got = done.size >= b.at;
            return (
              <span key={b.label} className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${got ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                <Award className="h-3.5 w-3.5" />{b.label}
              </span>
            );
          })}
        </div>
      </section>

      <ol className="space-y-2">
        {TRAINING_STEPS.map((s, i) => {
          const ok = done.has(s.key);
          return (
            <li key={s.key}>
              <button onClick={() => toggle(s.key)} className="card-soft flex w-full items-start gap-3 text-left">
                {ok ? <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-primary" /> : <Circle className="mt-0.5 h-6 w-6 shrink-0 text-muted-foreground" />}
                <div>
                  <p className="font-semibold">{i + 1}. {s.title}</p>
                  <p className="text-sm text-muted-foreground">{s.text}</p>
                </div>
              </button>
            </li>
          );
        })}
      </ol>

      <section className="card-soft">
        <h2 className="text-xl font-semibold">Comprendre le plan de rémunération</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          On démarre au statut « Affilié(e) – en démarrage », puis on progresse à travers 14 rangs en développant sa clientèle et son équipe.
        </p>
        <ol className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-3">
          {RANKS.map((r, i) => (
            <li key={r.name} className="flex items-center gap-2 rounded-xl bg-muted p-2.5 text-sm">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-primary-foreground" style={{ background: r.color }}>{i + 1}</span>
              {r.name}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
