# Vérifier le build (comme Railway) puis le déploiement

## 1. Sur ton Mac — même commande que le serveur

À la racine du projet :

```bash
cd "/Users/hassenhicheri/Desktop/pepite festival"
npm ci
npm run build
```

Ou en une ligne :

```bash
npm run verify
```

**Si ça finit avec** `✓ Compiled successfully` **et** `Route (app)` **sans erreur → le build est bon.** Railway fera pareil (`npm ci` + `npm run build` via `nixpacks.toml`).

---

## 2. Pousser le code sur GitHub

```bash
git status
git add .
git commit -m "ton message"
git push origin main
```

---

## 3. Sur Railway — être sûr que le *nouveau* code est en ligne

1. Ouvre le projet → ton service **ordo-festival**.
2. Onglet **Deployments** : en haut de la liste, tu dois voir un déploiement **en cours** ou **réussi** dont l’heure correspond à **après** ton `git push`.
3. Si **rien de nouveau** après le push : **Settings → Source** → vérifie repo + branche `main` → bouton **Redeploy** sur le dernier commit.
4. Si un deploy est **rouge** : clique dessus → **Build logs** → la fin du fichier indique l’erreur (copie-colle pour debug).

---

## 4. Test rapide dans le navigateur

Remplace par ton domaine Railway :

- [ ] `https://TON-URL/networking` s’ouvre  
- [ ] `https://TON-URL/stand` s’ouvre (page QR)  
- [ ] `https://TON-URL/api/config` renvoie du JSON (`demoMode`, etc.)

Si une de ces URLs ne marche pas alors que le deploy est vert, vide le cache du navigateur ou teste en navigation privée.

---

## Variables utiles (Railway → Variables)

| Variable | Exemple |
|----------|---------|
| `ORDO_DEMO_MODE` | `true` pour tester |
| `ORDO_WAVE_MINUTES` | `5` — durée d’une vague check-in (minutes) |
| `ORDO_BUILD_LABEL` | Optionnel — texte libre affiché dans `/api/config` (ex. `test-20mai`) pour confirmer le bon deploy |

Après changement de variables, Railway **redéploie** tout seul.

---

## Vérifier que le **bon code** est en ligne

### Méthode 1 — Railway (la plus fiable)

1. **Deployments** → ouvre le dernier deploy **vert**.
2. Note le **commit** affiché (ex. `e5b2844`).
3. Sur **GitHub** → ton repo → dernier commit sur `main` : les **7 premiers caractères** doivent **matcher**.

### Méthode 2 — `/api/config` dans le navigateur

Ouvre : `https://TON-URL/api/config`

- Si tu vois **`commitShort`** (ex. `"e5b2844"`) → compare avec GitHub (Railway injecte souvent `RAILWAY_GIT_COMMIT_SHA`).
- Si `commitShort` est `null` → utilise la méthode 1, ou ajoute sur Railway une variable **`ORDO_BUILD_LABEL`** = par ex. `v2-no-autostart`, sauvegarde, redeploy, puis recharge `/api/config` : tu dois voir `"buildLabel":"v2-no-autostart"`.

### Méthode 3 — Comportement (anti auto-start)

1. Deux téléphones : check-in avec le **même** `wave` (QR hôte actuel).
2. **Sans** toucher au PC hôte → les deux doivent rester en **attente** (pas d’écran live).
3. Tu cliques **Lancer maintenant** → là seulement ça passe en live.

Si ça démarre encore tout seul à 2 personnes → tu n’es **pas** sur le dernier deploy (ou cache navigateur : essaie navigation privée).

---

## 5. Tester « pour de vrai » sur Railway (mode démo)

Sans ça, `/api/config` affiche `demoMode: false` → **2 min × 5 tours** et horaires 14h–17h (festival réel).

### Activer le mode test

1. [railway.app](https://railway.app) → projet → service **ordo-festival** (ou le nom de ton service).
2. Onglet **Variables** (ou **Settings → Variables** selon l’UI).
3. **New Variable**  
   - **Name :** `ORDO_DEMO_MODE`  
   - **Value :** `true`  
   (respecter exactement `true`, pas `True` ni `1`.)
4. **Add** / **Save** → attend **30 s à 2 min** : un nouveau déploiement démarre tout seul.

### Vérifier que c’est bien actif

Ouvre en navigation privée (évite le cache) :

`https://TON-URL/api/config`

Tu dois voir **exactement** :

```json
{
  "demoMode": true,
  "roundDurationSec": 15,
  "totalRounds": 3,
  "waveDurationMs": 300000,
  "commitShort": "e5b2844",
  "buildLabel": null
}
```

- Si `demoMode` est encore `false` → la variable n’est pas sur le **bon service**, ou le redeploy n’est pas fini, ou faute de frappe.

### Parcours de test (2 téléphones + ton PC)

1. **PC** : `https://TON-URL/session/now/host` (QR + compteur + **Lancer**).
2. **Tél A & B** : `https://TON-URL/networking` → onboarding → **Maintenant** → check-in (lien avec `?wave=` depuis le QR du PC).
3. Quand l’hôte affiche **≥ 2 prêts** → **Lancer maintenant**.
4. Les deux tél : écran **live** avec prénom + timer **~15 s**.

### Après les tests

Supprime `ORDO_DEMO_MODE` ou mets `false` → retour config festival (`demoMode: false`, 120 s, 5 tours).
