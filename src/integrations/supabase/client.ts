import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Les deux valeurs viennent de Supabase > Project Settings > API.
// En local : fichier .env (voir .env.example). Sur Netlify : variables d'environnement du site.
function createSupabaseClient() {
  const url = import.meta.env["VITE_SUPABASE_URL"] as string | undefined;
  const key = import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] as string | undefined;

  if (!url || !key) {
    const missing = [
      ...(!url ? ["VITE_SUPABASE_URL"] : []),
      ...(!key ? ["VITE_SUPABASE_PUBLISHABLE_KEY"] : []),
    ];
    const message = `Variable(s) manquante(s) : ${missing.join(", ")}. Renseignez-les dans .env (en local) ou dans les variables d'environnement Netlify.`;
    console.error(`[Supabase] ${message}`);
    throw new Error(message);
  }

  return createClient<Database>(url, key, {
    auth: {
      // Le stockage de session n'existe que dans le navigateur.
      storage: typeof window === "undefined" ? undefined : window.localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

let _supabase: ReturnType<typeof createSupabaseClient> | undefined;

// Utilisation : import { supabase } from "@/integrations/supabase/client";
export const supabase = new Proxy({} as ReturnType<typeof createSupabaseClient>, {
  get(_, prop, receiver) {
    if (!_supabase) _supabase = createSupabaseClient();
    return Reflect.get(_supabase, prop, receiver);
  },
});
