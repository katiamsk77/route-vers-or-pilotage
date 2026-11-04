import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Leaf, Pencil, Plus, PlayCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useMe } from "@/lib/auth";
import { PRODUCT_RANGES, affiliatePrice, formatPrice } from "@/lib/business";
import { PageHeader, meta } from "@/components/app/PageHeader";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Product = Tables<"products">;
const DISCLAIMER =
  "Ces déclarations n'ont pas été évaluées par les autorités de santé. Ces produits ne sont pas destinés à diagnostiquer, traiter, guérir ou prévenir une maladie.";

export const Route = createFileRoute("/_authenticated/catalogue")({
  head: () => meta("Catalogue", "Les gammes et produits Vital Health avec prix public et affilié."),
  component: Catalogue,
});

function Catalogue() {
  const { data: me } = useMe();
  const currency = me?.currency ?? "USD";
  const [view, setView] = useState<Product | null>(null);
  const [edit, setEdit] = useState<Partial<Product> | null>(null);
  const { data = [] } = useQuery({
    queryKey: ["products"],
    queryFn: async () => (await supabase.from("products").select("*").order("sort")).data ?? [],
  });

  return (
    <div>
      <PageHeader
        title="Catalogue"
        subtitle="Prix public et prix affilié (−33 %)"
        action={me?.isAdmin && <Button className="rounded-full" onClick={() => setEdit({ range: "Désintoxication", color: "#2f7d4f", public_price: 0, videos: [] })}><Plus className="h-4 w-4" />Produit</Button>}
      />
      <div className="space-y-6">
        {PRODUCT_RANGES.map((r) => {
          const items = data.filter((p) => p.range === r);
          return (
            <section key={r}>
              <h2 className="mb-2 text-xl font-semibold">{r === "Sportifs" ? "Ligne Sportifs" : r}</h2>
              {items.length === 0 ? (
                <p className="rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">Produits à venir.</p>
              ) : (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  {items.map((p) => (
                    <button key={p.id} onClick={() => setView(p)} className="card-soft overflow-hidden p-0 text-left">
                      <div className="flex aspect-square items-center justify-center" style={{ background: `${p.color}22` }}>
                        {p.image_url ? <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" loading="lazy" /> : <Leaf className="h-12 w-12" style={{ color: p.color }} />}
                      </div>
                      <div className="p-3">
                        <p className="font-semibold" style={{ color: p.color }}>{p.name}</p>
                        <p className="text-xs text-muted-foreground">{formatPrice(Number(p.public_price), currency)}</p>
                        <p className="text-sm font-semibold text-primary">{formatPrice(affiliatePrice(Number(p.public_price)), currency)} <span className="text-xs font-normal">affilié</span></p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
      <p className="mt-8 text-xs text-muted-foreground">{DISCLAIMER}</p>

      <Dialog open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl p-0">
          {view && (
            <div>
              <div className="flex h-48 items-center justify-center rounded-t-3xl" style={{ background: `${view.color}26` }}>
                {view.image_url ? <img src={view.image_url} alt={view.name} className="h-full w-full rounded-t-3xl object-cover" /> : <Leaf className="h-16 w-16" style={{ color: view.color }} />}
              </div>
              <div className="space-y-4 p-5">
                <DialogHeader>
                  <DialogTitle className="text-2xl" style={{ color: view.color }}>{view.name}</DialogTitle>
                  {view.tagline && <p className="text-sm text-muted-foreground">{view.tagline}</p>}
                </DialogHeader>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-2xl bg-muted p-3"><p className="text-xs text-muted-foreground">Prix public</p><p className="text-lg font-semibold">{formatPrice(Number(view.public_price), currency)}</p></div>
                  <div className="rounded-2xl bg-leaf-soft p-3"><p className="text-xs text-muted-foreground">Prix affilié</p><p className="text-lg font-semibold text-primary">{formatPrice(affiliatePrice(Number(view.public_price)), currency)}</p></div>
                </div>
                <Block title="Bienfaits" text={view.benefits} list />
                <Block title="Ingrédients" text={view.ingredients} />
                <Block title="Mode d'emploi" text={view.usage} />
                {view.videos.length > 0 && (
                  <div>
                    <h3 className="mb-1 font-semibold">Vidéos</h3>
                    {view.videos.map((v) => <a key={v} href={v} target="_blank" rel="noreferrer" className="flex items-center gap-2 py-1 text-sm text-primary"><PlayCircle className="h-4 w-4" />{v}</a>)}
                  </div>
                )}
                {me?.isAdmin && <Button variant="outline" className="w-full rounded-full" onClick={() => { setEdit(view); setView(null); }}><Pencil className="h-4 w-4" />Modifier</Button>}
                <p className="text-xs text-muted-foreground">{DISCLAIMER}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <ProductEditor product={edit} onClose={() => setEdit(null)} />
    </div>
  );
}

function Block({ title, text, list }: { title: string; text: string | null; list?: boolean }) {
  if (!text) return null;
  const lines = text.split(/\\n|\n/).filter(Boolean);
  return (
    <div>
      <h3 className="mb-1 font-semibold">{title}</h3>
      {list ? <ul className="list-disc space-y-0.5 pl-5 text-sm">{lines.map((l) => <li key={l}>{l}</li>)}</ul> : <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}

function ProductEditor({ product, onClose }: { product: Partial<Product> | null; onClose: () => void }) {
  const qc = useQueryClient();
  const [p, setP] = useState<Partial<Product>>({});
  useEffect(() => { if (product) setP({ ...product, benefits: product.benefits?.replace(/\\n/g, "\n") }); }, [product]);
  const set = (k: keyof Product, v: unknown) => setP((x) => ({ ...x, [k]: v }));

  async function save() {
    if (!p.name) return toast.error("Nom obligatoire");
    const { error } = p.id
      ? await supabase.from("products").update(p as Product).eq("id", p.id)
      : await supabase.from("products").insert(p as Product);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["products"] });
    onClose();
  }
  async function remove() {
    if (!p.id || !confirm("Supprimer ce produit ?")) return;
    await supabase.from("products").delete().eq("id", p.id);
    qc.invalidateQueries({ queryKey: ["products"] });
    onClose();
  }

  return (
    <Dialog open={!!product} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl">
        <DialogHeader><DialogTitle>{p.id ? "Modifier le produit" : "Nouveau produit"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1"><Label>Nom</Label><Input value={p.name ?? ""} onChange={(e) => set("name", e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1"><Label>Gamme</Label>
              <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={p.range ?? ""} onChange={(e) => set("range", e.target.value)}>
                {PRODUCT_RANGES.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div className="space-y-1"><Label>Couleur</Label><Input type="color" value={p.color ?? "#2f7d4f"} onChange={(e) => set("color", e.target.value)} /></div>
            <div className="space-y-1"><Label>Prix public</Label><Input type="number" step="0.01" value={p.public_price ?? 0} onChange={(e) => set("public_price", Number(e.target.value))} /></div>
            <div className="space-y-1"><Label>Prix affilié (auto)</Label><Input disabled value={affiliatePrice(Number(p.public_price ?? 0))} /></div>
          </div>
          <div className="space-y-1"><Label>Photo (lien)</Label><Input value={p.image_url ?? ""} onChange={(e) => set("image_url", e.target.value)} /></div>
          <div className="space-y-1"><Label>Accroche</Label><Input value={p.tagline ?? ""} onChange={(e) => set("tagline", e.target.value)} /></div>
          <div className="space-y-1"><Label>Bienfaits (un par ligne)</Label><Textarea value={p.benefits ?? ""} onChange={(e) => set("benefits", e.target.value)} /></div>
          <div className="space-y-1"><Label>Ingrédients</Label><Textarea value={p.ingredients ?? ""} onChange={(e) => set("ingredients", e.target.value)} /></div>
          <div className="space-y-1"><Label>Mode d'emploi</Label><Textarea value={p.usage ?? ""} onChange={(e) => set("usage", e.target.value)} /></div>
          <div className="space-y-1"><Label>Vidéos (un lien par ligne)</Label><Textarea value={(p.videos ?? []).join("\n")} onChange={(e) => set("videos", e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))} /></div>
          <div className="flex gap-2">
            {p.id && <Button variant="ghost" onClick={remove}>Supprimer</Button>}
            <Button className="flex-1 rounded-full" onClick={save}>Enregistrer</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
