# myvitalhealth

Outil de travail et de formation pour les affiliés Vital Health : réseau (prospects, clients, partenaires), catalogue, formation et outils, sur téléphone et ordinateur.

L'appli repose sur trois services gratuits :

| Service | Rôle |
| --- | --- |
| **GitHub** (ici) | garde le code de l'appli |
| **Supabase** | garde les données : comptes, contacts, catalogue, PDF de scan |
| **Netlify** | met l'appli en ligne et lui donne son adresse |

Chaque modification envoyée sur GitHub met l'appli en ligne à jour toute seule, en 1 à 2 minutes.

---

## Installation (une seule fois, environ 30 minutes)

### Étape 1 — Créer la base de données (Supabase)

1. Allez sur [supabase.com](https://supabase.com), cliquez sur **Start your project** et créez un compte (le plus simple : « Continue with GitHub »).
2. Cliquez sur **New project** :
   - **Name** : `myvitalhealth`
   - **Database Password** : cliquez sur **Generate a password** et gardez-le précieusement
   - **Region** : choisissez une région en Europe (par exemple *West EU (Paris)*), pour le RGPD
   - Cliquez sur **Create new project** et attendez 1 à 2 minutes.
3. Dans le menu de gauche, ouvrez **SQL Editor**, puis **New query**.
4. Ouvrez le fichier [`supabase/setup.sql`](supabase/setup.sql) de ce dépôt, copiez **tout** son contenu, collez-le dans Supabase, puis cliquez sur **Run**. Le message « Success. No rows returned » confirme que tout est créé.
5. Récupérez les deux informations de connexion : menu **Project Settings** (roue dentée) → **Data API** pour l'**URL du projet**, puis **API Keys** pour la **Publishable key** (elle commence par `sb_publishable_`). Notez-les, elles servent à l'étape 2.

> La clé « publishable » peut être utilisée dans l'appli sans risque : les règles de sécurité de la base font que chacun ne voit que ses propres contacts. Ne copiez jamais la clé **secret** nulle part.

### Étape 2 — Mettre l'appli en ligne (Netlify)

1. Allez sur [netlify.com](https://www.netlify.com) et créez un compte avec **Sign up with GitHub**.
2. Cliquez sur **Add new project** → **Import an existing project** → **GitHub**, autorisez Netlify, puis choisissez ce dépôt.
3. Ne touchez pas aux réglages de construction : ils sont déjà dans le fichier `netlify.toml`.
4. Avant de lancer, ouvrez **Add environment variables** (ou, après coup, **Site configuration** → **Environment variables**) et ajoutez :
   - `VITE_SUPABASE_URL` = l'URL du projet Supabase (étape 1.5)
   - `VITE_SUPABASE_PUBLISHABLE_KEY` = la Publishable key (étape 1.5)
5. Cliquez sur **Deploy**. Au bout de 1 à 2 minutes, Netlify affiche l'adresse de l'appli (du type `https://xxxx.netlify.app`). Vous pouvez la renommer dans **Site configuration** → **Change site name**, par exemple `myvitalhealth.netlify.app`.

> Si vous ajoutez ou modifiez une variable après le premier déploiement, relancez-le : **Deploys** → **Trigger deploy** → **Deploy site**.

### Étape 3 — Relier Supabase à l'adresse de l'appli

Sans cette étape, les liens envoyés par e-mail (confirmation de compte, mot de passe oublié) ne mènent pas à l'appli.

1. Dans Supabase, ouvrez **Authentication** → **URL Configuration**.
2. **Site URL** : collez l'adresse Netlify (par exemple `https://myvitalhealth.netlify.app`).
3. **Redirect URLs** : cliquez sur **Add URL** et ajoutez la même adresse suivie de `/**` (par exemple `https://myvitalhealth.netlify.app/**`). Enregistrez.

### Étape 4 — Créer le compte administrateur

1. Ouvrez l'appli, cliquez sur **Se connecter**, puis **Créer un compte**.
2. **Le tout premier compte créé devient automatiquement administrateur** : créez donc le vôtre avant d'inviter qui que ce soit. L'administrateur est la seule personne qui peut modifier le contenu commun (catalogue, prix, scripts, agenda d'équipe).
3. Confirmez votre adresse avec le lien reçu par e-mail, puis connectez-vous.

> **Les e-mails de confirmation n'arrivent pas ?** Le service d'e-mails gratuit de Supabase n'envoie que quelques messages par heure, et certaines boîtes (Orange, Wanadoo…) les bloquent. Deux solutions :
> - pour démarrer, désactivez la confirmation : Supabase → **Authentication** → **Sign In / Providers** → **Email** → décochez **Confirm email** → **Save** ;
> - pour l'ouverture à toute l'équipe, branchez un vrai service d'envoi (par exemple Brevo ou Resend, gratuits pour un petit volume) dans **Authentication** → **Emails** → **SMTP Settings**.

### Étape 5 — Installer l'appli sur le téléphone

Ouvrez l'adresse de l'appli dans le navigateur du téléphone, puis :
- **iPhone (Safari)** : bouton Partager → **Sur l'écran d'accueil** ;
- **Android (Chrome)** : menu ⋮ → **Ajouter à l'écran d'accueil**.

---

## Modifier l'appli

Toute modification enregistrée dans la branche `main` de ce dépôt est mise en ligne automatiquement par Netlify. Si une modification casse la construction, Netlify garde la version précédente en ligne : l'appli ne tombe pas, et l'erreur est visible dans **Deploys**.

**Le plus simple : demander à Claude.** Connectez votre compte GitHub à Claude, ouvrez ce dépôt, puis décrivez le changement voulu en français (« ajoute un champ anniversaire sur la fiche client », « remplace les étapes de la Route vers l'Or par… »). Claude modifie le code et l'envoie sur GitHub.

**Une petite correction de texte ?** Sur GitHub, ouvrez le fichier, cliquez sur l'icône crayon, modifiez, puis **Commit changes**.

**Où se trouve quoi :**

| Je veux changer… | Fichier |
| --- | --- |
| les étapes du vivier, les rangs, la Route vers l'Or, la revue hebdomadaire, le parcours de formation, les pensées du jour | `src/lib/business.ts` |
| la page Aujourd'hui | `src/routes/_authenticated/aujourdhui.tsx` |
| Mon réseau (vivier, clients, partenaires) | `src/routes/_authenticated/reseau.tsx` et `src/components/app/ContactDialog.tsx` |
| le catalogue | `src/routes/_authenticated/catalogue.tsx` |
| Apprendre | `src/routes/_authenticated/apprendre.tsx` |
| Outils | `src/routes/_authenticated/outils.tsx` |
| les couleurs et polices | `src/styles.css` |
| le logo et l'icône | `public/icon-192.png`, `public/icon-512.png`, `public/favicon.png` |

**Les produits, prix, scripts et événements d'équipe** ne sont pas dans le code : l'administrateur les ajoute et les modifie directement depuis l'appli.

**Changer la structure de la base** (par exemple ajouter un champ) : la modification du code doit s'accompagner d'un petit bout de SQL à exécuter dans Supabase → **SQL Editor**. Claude vous le donnera en même temps que la modification.

---

## Pour les développeurs

```bash
cp .env.example .env   # puis renseigner les deux valeurs Supabase
npm install
npm run dev            # http://localhost:5173
npm test
npm run build
```

Stack : TanStack Start (React 19), Tailwind CSS 4, shadcn/ui, Supabase (auth, Postgres avec sécurité par ligne, stockage), hébergement Netlify (`@netlify/vite-plugin-tanstack-start`). Le schéma complet de la base est dans `supabase/setup.sql`.
