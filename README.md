# Ordo — Festival Networking MVP

MVP minimal pour créer des rencontres réelles pendant un festival campus (Pépite Festival).

## Démarrage

```bash
npm install
npm run dev
```

### Tester tout de suite (mode démo)

En local (`npm run dev`), le **mode test** est activé automatiquement :

- Pas d’attente jusqu’à 14h / 15h…
- Tours de **15 secondes** (au lieu de 2 min)
- **3 rotations** (au lieu de 5)

Sur **Railway**, ajoute la variable d’environnement puis redéploie :

| Variable | Valeur |
|----------|--------|
| `ORDO_DEMO_MODE` | `true` |
| `ORDO_WAVE_MINUTES` | `5` (défaut) — durée d’une vague avant nouveau code check-in |

Chaque session a un **code vague** dans l’URL : `/session/now/checkin?wave=XXXXXX`. Toutes les X minutes (ou à la fin d’une session live), le code change : les anciens QR / liens ne comptent plus. L’**iPad hôte** et la page **`/stand`** affichent un QR **mis à jour** automatiquement.

**Test rapide (2 téléphones) :**

1. `https://TON-URL/networking` → onboarding sur chaque téléphone  
2. Même session (ex. 14:00) → check-in (`/session/14-00/checkin`)  
3. iPad / PC : `/session/14-00/host` → **Lancer maintenant** (obligatoire, pas de démarrage auto)  
4. Les deux voient partenaire + timer 15 s  

Avant le festival : mets `ORDO_DEMO_MODE` à `false` ou supprime la variable.

**Compteur sur la page hôte :** ce n’est pas “qui a scanné le QR au stand”. Chaque téléphone qui **ouvre le lien check-in** (QR ou URL) est compté, et les données restent en mémoire sur Railway jusqu’au prochain redéploiement. En mode test, la page hôte propose **Vider cette session** pour repartir à 0.

Ouvre [http://localhost:3000/networking](http://localhost:3000/networking)

## Parcours étudiant

1. **Stand** → QR vers `/networking`
2. **Onboarding** → `/onboarding` (30 s)
3. **Sessions** → `/sessions` (14h, 15h, 16h, 17h)
4. **Attente** → `/session/[id]/wait` (compte à rebours)
5. **Check-in** → scan QR session → `/session/[id]/checkin`
6. **Live** → `/session/[id]/live` (partenaire, icebreaker, timer 2 min × 5)

## QR codes à imprimer

| Usage | URL |
|-------|-----|
| Stand principal | `https://VOTRE-DOMAINE/networking` |
| Check-in session 14h | `https://VOTRE-DOMAINE/session/14-00/checkin` |
| Check-in session 15h | `https://VOTRE-DOMAINE/session/15-00/checkin` |
| Check-in session 16h | `https://VOTRE-DOMAINE/session/16-00/checkin` |
| Check-in session 17h | `https://VOTRE-DOMAINE/session/17-00/checkin` |
| **Hôte stand** (iPad) | `https://VOTRE-DOMAINE/session/14-00/host` |

## Mode hôte (stand)

Sur l’iPad ou le PC : `/session/14-00/host` (etc.) → **Lancer maintenant** quand ~10 participants ont fait le check-in avec le QR du moment. La session **ne démarre pas** toute seule : c’est toujours le hôte qui lance.

## Matching

- Shuffle + appariement glouton (priorité intérêts communs)
- 5 rotations × 2 minutes
- Pas d’IA, pas de graphe social

## Limites MVP

- État en mémoire (redémarrage serveur = reset) — OK pour une journée de festival
- Un seul serveur (pas de scaling multi-instance)
- Pour la prod : brancher Redis ou une DB

## Hébergement (production)

### Important

L’app garde les sessions **en mémoire** (Map côté serveur). Il faut **un seul processus Node** qui tourne en continu.

| Plateforme | Recommandé ? | Pourquoi |
|------------|--------------|----------|
| **Railway**, **Render**, **Fly.io**, VPS | Oui | `npm start` = un serveur, état partagé entre tous les téléphones |
| **Vercel** (serverless) | Non pour ce MVP | Chaque requête API peut partir sur une autre instance → profils / matchs incohérents |

---

### Option A — Railway (le plus simple)

1. Pousse le projet sur **GitHub** (repo privé ou public).
2. Va sur [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub** → choisis le repo.
3. Railway détecte Next.js. Sinon, règle :
   - **Build command:** `npm run build`
   - **Start command:** `npm run start`
4. **Settings → Networking → Generate domain** → tu obtiens une URL du type `https://ordo-festival.up.railway.app`.
5. Remplace `VOTRE-DOMAINE` dans les QR codes par cette URL.

CLI alternative (sans GitHub) :

```bash
npm i -g @railway/cli
railway login
cd "/chemin/vers/pepite festival"
railway init
railway up
railway domain
```

---

### Option B — Render

1. [render.com](https://render.com) → **New → Web Service** → repo GitHub.
2. **Environment:** Node
3. **Build command:** `npm install && npm run build`
4. **Start command:** `npm start`
5. Plan **Free** ou **Starter** → **Create**.
6. URL fournie : `https://ordo-festival.onrender.com` (exemple).

Sur le plan gratuit, le service **s’endort** après ~15 min sans trafic → premier scan QR lent. Pour le jour J, prends au moins **Starter** ou Railway.

---

### Option C — Vercel (déconseillé pour ce MVP)

Utile seulement si tu ajoutes plus tard Redis / une DB. Sans ça, le matching peut casser.

```bash
npm i -g vercel
vercel login
vercel --prod
```

---

### Option D — Ton Mac / PC au stand (zéro deploy)

Si le réseau du festival est capricieux :

1. Sur la machine qui fait tourner l’app : `npm run build && npm run start -H 0.0.0.0`
2. Trouve l’IP locale : `ipconfig getifaddr en0` (Mac Wi‑Fi) → ex. `192.168.1.42`
3. Tous les téléphones sur le **même Wi‑Fi** scannent : `http://192.168.1.42:3000/networking`
4. iPad hôte : `http://192.168.1.42:3000/session/14-00/host`

Limite : pas d’HTTPS (souvent OK pour un MVP en LAN). Pas accessible depuis la 4G des étudiants hors Wi‑Fi du stand.

---

### Option E — Tunnel rapide (test avant le festival)

Expose ton `npm run dev` local sans deploy :

```bash
npx ngrok http 3000
```

Tu reçois une URL `https://xxxx.ngrok-free.app` → mets-la dans les QR (compte gratuit ngrok).

---

### QR codes en production

Génère les QR avec l’URL **HTTPS** finale, par ex. [qr.io](https://www.qr-code-generator.com/) ou Canva :

- `https://TON-DOMAINE/networking`
- `https://TON-DOMAINE/session/14-00/checkin`
- etc.

Imprime-les pour le stand + garde l’iPad sur `/session/14-00/host`.

---

### Checklist jour J

- [ ] Deploy sur Railway/Render (ou Mac en `0.0.0.0` + Wi‑Fi stand)
- [ ] Tester sur 2 vrais téléphones : onboarding → join → check-in → host start → live
- [ ] iPad hôte chargé, page host ouverte
- [ ] QR imprimés avec la bonne URL (pas `localhost`)
- [ ] Batterie / 4G de secours si Wi‑Fi campus faible

---

## Stack

Next.js 15 · React 19 · Tailwind 4 · API Routes
