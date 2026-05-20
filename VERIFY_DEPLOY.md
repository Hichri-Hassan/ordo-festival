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
| `ORDO_WAVE_MINUTES` | `5` (durée d’une vague check-in) |

Après changement de variables, Railway **redéploie** tout seul.
