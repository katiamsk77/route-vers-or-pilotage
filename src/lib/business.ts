// Règles métier myvitalhealth
export const AFFILIATE_DISCOUNT = 0.33;

export function affiliatePrice(publicPrice: number): number {
  return Math.round(publicPrice * (1 - AFFILIATE_DISCOUNT) * 100) / 100;
}

export function formatPrice(value: number, currency: string): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(value);
}

/** Relance de fin de cure : 7 jours avant la fin de la cure. */
export const FOLLOWUP_DAYS_BEFORE_END = 7;
export function cureFollowupDate(orderDate: string | null, cureDays: number | null): string | null {
  if (!orderDate) return null;
  const d = new Date(orderDate + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + (cureDays ?? 30) - FOLLOWUP_DAYS_BEFORE_END);
  return d.toISOString().slice(0, 10);
}

/** Série : nombre de jours consécutifs (jusqu'à aujourd'hui ou hier) où toutes les actions sont cochées. */
export function computeStreak(actions: { day: string; done: boolean }[], today: string): number {
  const byDay = new Map<string, boolean>();
  for (const a of actions) byDay.set(a.day, (byDay.get(a.day) ?? true) && a.done);
  const d = new Date(today + "T00:00:00Z");
  if (!byDay.get(today)) d.setUTCDate(d.getUTCDate() - 1);
  let n = 0;
  while (byDay.get(d.toISOString().slice(0, 10))) {
    n++;
    d.setUTCDate(d.getUTCDate() - 1);
  }
  return n;
}

export function todayISO(): string {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

export const PROSPECT_STAGES = [
  "Premier contact",
  "Conversation",
  "Présentation envoyée",
  "Scan facial réalisé",
  "Scan quantique réalisé",
  "Suivi",
  "Décision",
];
export const DECISIONS = ["Client", "Partenaire", "Recommandation", "Pas maintenant"];

export const RANKS: { name: string; color: string }[] = [
  { name: "Bronze", color: "#b0703c" },
  { name: "Argent", color: "#9aa3ad" },
  { name: "Saphir", color: "#2f5fb3" },
  { name: "Or", color: "#d4a62a" },
  { name: "Platine", color: "#8fa8b8" },
  { name: "Émeraude", color: "#1f9a63" },
  { name: "Diamant", color: "#6cc4e0" },
  { name: "Double", color: "#4b8fd1" },
  { name: "Triple", color: "#3463a8" },
  { name: "Rouge", color: "#c8323c" },
  { name: "Vert", color: "#3f9b3a" },
  { name: "Bleu", color: "#2457c5" },
  { name: "Violet", color: "#7a3fb0" },
  { name: "Noir Diamant", color: "#1d1d1f" },
];
export const START_RANK = "Affilié(e) – en démarrage";
export function rankColor(rank: string | null): string {
  return RANKS.find((r) => r.name === rank)?.color ?? "#7fb24a";
}

export const ROAD_TO_GOLD = [
  "Définir son « pourquoi »",
  "Activer son autoship",
  "Faire son propre scan",
  "Lister 100 contacts",
  "Partager 10 présentations",
  "Inscrire 2 premiers clients",
  "Parrainer 1er partenaire",
  "Parrainer 2e partenaire",
  "Aider ses partenaires à démarrer",
  "Atteindre le rang Or",
];

export const WEEKLY_REVIEW = [
  "Combien de nouveaux contacts cette semaine ?",
  "Combien de présentations envoyées ?",
  "Combien de scans réalisés ?",
  "Combien de nouveaux clients ?",
  "Combien de nouveaux partenaires ?",
  "As-tu participé au Zoom d'équipe ?",
  "Quelle a été ta plus belle victoire ?",
  "Quel est ton objectif pour la semaine prochaine ?",
];

export const PRODUCT_RANGES = ["Désintoxication", "Restaurer", "Nourrir", "Éveiller", "Enfants", "Sportifs"];

export const TRAINING_STEPS = [
  { key: "inscription", title: "Inscription", text: "Créer son compte affilié Vital Health avec le lien de sa marraine." },
  { key: "recuperation", title: "Récupération de compte", text: "Savoir réinitialiser son mot de passe et sécuriser son adresse e-mail." },
  { key: "pin", title: "Code PIN portefeuille", text: "Définir le code PIN de son portefeuille pour retirer ses commissions." },
  { key: "autoship", title: "Autoship", text: "Mettre en place sa commande automatique mensuelle." },
  { key: "commissions", title: "Commissions", text: "Comprendre où voir et comment retirer ses commissions." },
  { key: "scanner", title: "Scanner", text: "Réaliser un scan facial et un scan quantique, puis lire les résultats." },
  { key: "vpulso", title: "VPulso", text: "Découvrir l'application VPulso et ses fonctionnalités." },
];

export const THOUGHTS = [
  "Chaque petit pas compte : avancez avec constance.",
  "Prenez soin de vous pour mieux prendre soin des autres.",
  "L'abondance commence par la gratitude.",
  "Une conversation sincère vaut mille messages.",
  "Votre énergie inspire votre équipe.",
  "Semez aujourd'hui, récoltez demain.",
  "La régularité bat le talent quand le talent n'est pas régulier.",
];
