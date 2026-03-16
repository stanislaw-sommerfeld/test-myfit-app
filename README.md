# 🏉 Rugby Performance App

Application web progressive (PWA) — suivi d'entraînement rugby avec prédictions IA.

## Fonctionnalités

- 📅 Programme semaine adapté (Rugby Lun/Mer/Jeu 17h30, salle Mar/Ven/Sam)
- 🤖 Prédiction IA des poids à soulever (algorithme de progression + RPE + fatigue)
- 📹 Vidéos de démonstration des exercices
- 💪 Muscles travaillés + où sentir l'effort + cues techniques
- 📊 Graphiques de progression (poids corporel + charges)
- 🧍 Routine posture quotidienne (correction cou en avant)
- 🔔 Notifications de rappel de séances
- 📱 Installable sur iPhone (PWA)

## Déploiement sur GitHub Pages (gratuit)

### Étape 1 — Créer le dépôt
1. Va sur [github.com](https://github.com) → bouton vert **New**
2. Nom du dépôt : `rugby-perf`
3. Public ✓ → **Create repository**

### Étape 2 — Uploader les fichiers
**Option A — Interface web (plus simple) :**
1. Dans ton nouveau dépôt, clique **Add file → Upload files**
2. Glisse-dépose TOUS les fichiers (en gardant la structure de dossiers)
3. **Commit changes**

**Option B — Git en ligne de commande :**
```bash
git clone https://github.com/TON-USERNAME/rugby-perf.git
cp -r rugby-app/* rugby-perf/
cd rugby-perf
git add .
git commit -m "Initial app"
git push
```

### Étape 3 — Activer GitHub Pages
1. Dans ton dépôt → **Settings** (en haut)
2. Colonne gauche → **Pages**
3. Source : **Deploy from a branch**
4. Branch : **main** → dossier **/ (root)**
5. **Save**

### Étape 4 — Accéder à l'app
Ton URL sera : `https://TON-USERNAME.github.io/rugby-perf`

Attends 2-3 minutes la première fois, puis l'app est live.

### Étape 5 — Installer sur iPhone
1. Ouvre l'URL dans **Safari** (pas Chrome)
2. Bouton **Partager** (carré avec flèche)
3. **Sur l'écran d'accueil**
4. L'app apparaît comme une vraie app sur ton iPhone ✓

## Structure des fichiers

```
rugby-perf/
├── index.html          ← Page principale
├── manifest.json       ← Config PWA (iPhone)
├── css/
│   └── style.css       ← Tous les styles
├── js/
│   ├── app.js          ← Logique principale
│   ├── ai-engine.js    ← Algorithme de prédiction
│   └── storage.js      ← Sauvegarde locale
└── data/
    └── exercises.js    ← Exercices, programme, données
```

## Mise à jour des données

Pour modifier le programme ou ajouter des exercices :
- Édite `data/exercises.js` directement sur GitHub (bouton crayon)
- Les changements sont live dans les minutes qui suivent

## Notes

- Les données sont sauvegardées **localement sur l'iPhone** (localStorage)
- Pas de compte, pas de serveur, pas de coût
- Fonctionne hors-ligne une fois chargée
