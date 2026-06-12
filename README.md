# 🌿 Veriphy — Next.js 14 + Supabase + Vercel

## Mise en ligne en 3 étapes

### 1. Supabase
1. Ouvrir ton projet Supabase
2. SQL Editor → New query → coller `lib/supabase/schema.sql` → Run
3. Copier l'URL et les clés API

### 2. Variables d'environnement
```bash
cp .env.example .env.local
# Remplir NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
```

### 3. GitHub → Vercel
```bash
git init
git add .
git commit -m "🌿 Veriphy init"
# Pousser sur GitHub, connecter sur vercel.com
# Settings → Environment Variables → ajouter les vars de .env.example
# Settings → Domains → veriphy.app
```

### Créer le compte admin
Après ta première inscription sur veriphy.app/register :
```sql
UPDATE public.profiles SET role = 'admin' WHERE email = 'ton@email.com';
```

## Structure
```
app/
├── page.tsx                  → redirect login/dashboard
├── login/                    → connexion 4 langues
├── register/                 → inscription
├── dashboard/                → espace client
│   ├── alerts/               → alertes filtrables
│   ├── profile/              → cultures & notifs
│   └── pricing/              → plans & Stripe
├── admin/                    → espace admin (protégé)
│   ├── clients/              → gestion clients
│   ├── databases/            → explorer EU/MA/ES
│   ├── alerts/               → toutes les alertes
│   ├── stats/                → statistiques
│   └── pipeline/             → lancer diff engine
└── api/
    ├── alerts/               → CRUD alertes + plan limits
    ├── admin/                → stats admin
    ├── stripe/               → checkout + webhook
    └── cron/                 → pipeline mensuel (1er du mois)

lib/supabase/
├── client.ts                 → client navigateur
├── server.ts                 → client serveur + admin
└── schema.sql                → schéma DB à exécuter dans Supabase
```

## Activer Stripe (quand tu es prêt)
1. Créer compte Stripe → créer 3 produits (39€/99€/249€ mensuel)
2. Copier les Price IDs dans `.env.local`
3. Configurer webhook → `https://veriphy.app/api/stripe/webhook`
   Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
