import { createFileRoute, redirect, Outlet, Link, useLocation } from "@tanstack/react-router";
import { Sun, Users, ShoppingBag, GraduationCap, Wrench, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
  },
  component: Shell,
});

const NAV = [
  { to: "/aujourdhui", label: "Aujourd'hui", icon: Sun },
  { to: "/reseau", label: "Réseau", icon: Users },
  { to: "/catalogue", label: "Catalogue", icon: ShoppingBag },
  { to: "/apprendre", label: "Apprendre", icon: GraduationCap },
  { to: "/outils", label: "Outils", icon: Wrench },
] as const;

function Shell() {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-20 flex-col items-center gap-2 border-r bg-sidebar py-5 md:flex">
        <img src="/icon-192.png" alt="Vital Health" width={44} height={44} className="mb-4 rounded-xl" />
        {NAV.map((n) => {
          const active = pathname.startsWith(n.to);
          return (
            <Link
              key={n.to}
              to={n.to}
              title={n.label}
              className={`flex h-12 w-12 items-center justify-center rounded-2xl transition ${active ? "bg-primary text-primary-foreground shadow-soft" : "text-muted-foreground hover:bg-leaf-soft hover:text-primary"}`}
            >
              <n.icon className="h-5 w-5" />
            </Link>
          );
        })}
        <Link to="/reglages" title="Réglages" className="mt-auto flex h-12 w-12 items-center justify-center rounded-2xl text-muted-foreground hover:bg-leaf-soft">
          <Settings className="h-5 w-5" />
        </Link>
      </aside>

      <main className="mx-auto max-w-3xl px-4 pb-28 pt-5 md:ml-20 md:max-w-4xl md:px-8 md:pb-10 lg:mx-auto">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        {NAV.map((n) => {
          const active = pathname.startsWith(n.to);
          return (
            <Link key={n.to} to={n.to} className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium ${active ? "text-primary" : "text-muted-foreground"}`}>
              <span className={`flex h-8 w-12 items-center justify-center rounded-full ${active ? "bg-leaf-soft" : ""}`}>
                <n.icon className="h-5 w-5" />
              </span>
              {n.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
