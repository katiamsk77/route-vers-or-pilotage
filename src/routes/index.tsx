import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "myvitalhealth — Vivez une vie abondante" },
      { name: "description", content: "Votre espace de travail et de formation Vital Health : réseau, catalogue, formations et outils." },
      { property: "og:title", content: "myvitalhealth — Vivez une vie abondante" },
      { property: "og:description", content: "Votre espace de travail et de formation Vital Health." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/aujourdhui", replace: true });
    });
  }, [navigate]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <img src="/icon-192.png" alt="Logo Vital Health" width={96} height={96} className="rounded-3xl shadow-soft" />
      <h1 className="mt-6 text-4xl font-semibold text-forest">myvitalhealth</h1>
      <p className="mt-2 text-lg text-leaf">Vivez une vie abondante</p>
      <p className="mt-6 max-w-sm text-muted-foreground">
        Votre réseau, le catalogue, vos formations et vos outils, réunis au même endroit.
      </p>
      <Button asChild size="lg" className="mt-8 rounded-full px-8">
        <Link to="/auth">Se connecter</Link>
      </Button>
    </main>
  );
}
