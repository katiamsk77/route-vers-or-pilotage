import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Connexion — myvitalhealth" },
      { name: "description", content: "Connectez-vous à votre espace myvitalhealth." },
      { property: "og:title", content: "Connexion — myvitalhealth" },
      { property: "og:description", content: "Connectez-vous à votre espace myvitalhealth." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up" | "forgot">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/aujourdhui" });
      } else if (mode === "up") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin, data: { first_name: firstName } },
        });
        if (error) throw error;
        if (data.session) navigate({ to: "/aujourdhui" });
        else toast.success("Vérifiez votre boîte mail pour confirmer votre inscription.");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Un lien de réinitialisation vous a été envoyé.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <form onSubmit={submit} className="card-soft w-full max-w-sm space-y-4 p-6">
        <div className="text-center">
          <img src="/icon-192.png" alt="" width={56} height={56} className="mx-auto rounded-2xl" />
          <h1 className="mt-3 text-2xl font-semibold text-forest">
            {mode === "in" ? "Connexion" : mode === "up" ? "Créer mon compte" : "Mot de passe oublié"}
          </h1>
        </div>
        {mode === "up" && (
          <div className="space-y-1">
            <Label htmlFor="fn">Prénom</Label>
            <Input id="fn" required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </div>
        )}
        <div className="space-y-1">
          <Label htmlFor="em">E-mail</Label>
          <Input id="em" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        {mode !== "forgot" && (
          <div className="space-y-1">
            <Label htmlFor="pw">Mot de passe</Label>
            <Input id="pw" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
        )}
        <Button type="submit" className="w-full rounded-full" disabled={busy}>
          {mode === "in" ? "Se connecter" : mode === "up" ? "Créer mon compte" : "Envoyer le lien"}
        </Button>
        <div className="flex flex-col gap-1 text-center text-sm">
          {mode !== "in" && <button type="button" className="text-primary" onClick={() => setMode("in")}>J'ai déjà un compte</button>}
          {mode !== "up" && <button type="button" className="text-primary" onClick={() => setMode("up")}>Créer un compte</button>}
          {mode === "in" && <button type="button" className="text-muted-foreground" onClick={() => setMode("forgot")}>Mot de passe oublié ?</button>}
        </div>
      </form>
    </main>
  );
}
