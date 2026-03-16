# 🏉 Rugby Performance — Documentation

> Application web progressive (PWA) de suivi d'entraînement conçue sur mesure pour un joueur de rugby demi de mêlée / ouverture. Profil : 1m78 / 65kg → 70kg. Rugby lun/mer/jeu 17h30–19h.

**Fichier HTML unique · Aucun serveur · Aucun compte · Données locales · Gratuit**

---

## Déploiement GitHub Pages — 3 étapes

> L'app doit être servie en HTTPS. Ouvrir `index.html` directement sur l'iPhone ne fonctionne pas.

**Étape 1** — Créer le dépôt  
[github.com](https://github.com) → **New** → nom : `rugby-perf` → Public → **Create repository**

**Étape 2** — Uploader les fichiers  
Dans le dépôt → **Add file → Upload files** → glisse `index.html` + `manifest.json` → **Commit changes**

**Étape 3** — Activer GitHub Pages  
**Settings → Pages → Deploy from a branch → main / (root) → Save**

URL active en 1–3 min :
```
https://TON-USERNAME.github.io/rugby-perf
```

Pour mettre à jour : remplacer `index.html` dans le dépôt par la nouvelle version.

---

## Installation sur iPhone

1. Ouvre l'URL dans **Safari** (pas Chrome — Safari uniquement pour l'installation PWA iOS)
2. Icône **Partager** (carré + flèche en bas de l'écran)
3. **Sur l'écran d'accueil** → Ajouter

Icône 🏉 sur l'écran d'accueil, plein écran, **fonctionne hors-ligne** après le premier chargement.

---

## Fonctionnalités

### Accueil
- Séance du jour détectée automatiquement
- Jauge de fatigue interactive (1–10) qui calibre les prédictions IA
- Progression vers l'objectif de poids avec barre animée
- Résumé nutrition du jour, accès rapide Deezer

### Programme
- Semaine calée sur les créneaux rugby lun/mer/jeu
- Prédiction IA des poids recommandés par exercice
- Analyse IA avant séance (fatigue + historique récent)
- Fiches exercices avec animations SVG 60fps + vidéos YouTube

### Séance interactive
- Validation **série par série** : poids réel / reps réelles / RPE pour chaque série
- **5 patterns** : plat, montée progressive, descente, pyramide, drop set
- Poids pré-remplis par l'IA — modifiables
- **Minuteur de repos sticky** (déclenché automatiquement à la validation d'une série)
- **Chronomètre libre** pour les exercices cardio
- Ajout et suppression de séries à la volée
- Notes par exercice + note globale de séance
- Bouton Deezer accessible depuis la séance

### Stats et IA — 5 onglets

**Vue d'ensemble** — Courbe poids + projection IA, RPE hebdo, aperçu des 6 indices athlétiques

**Exercices** — 1RM estimé actuel, record, volume en tonnes, courbe 1RM réel vs prédit, détail série par série avec 1RM calculé pour chaque série, prochaine séance recommandée

**Muscles** — Donut chart volume cumulé par groupe, détail : sessions, exercices associés, qualité athlétique principale impactée

**Athlétisme** — 6 indices calculés depuis tes performances : vitesse, accélération 0–10m, explosivité, endurance, résistance aux blessures, impact contact. Radar du profil actuel, projection sur 8 semaines, explication scientifique de chaque indice.

**Sprints** — Enregistrement de chronos (10m / 20m / 30m / 40m), courbe d'évolution de la vitesse, comparaison séance précédente (meilleur / moins bon)

### Nutrition
- 5 repas : petit-déjeuner, déjeuner, collation, dîner, après séance
- Recherche **Open Food Facts** (600 000+ produits, nécessite internet)
- 12 aliments du programme pré-configurés avec macros exactes
- Saisie manuelle complète
- Barres de progression kcal / protéines / glucides / lipides vs objectifs

### Posture
- Routine quotidienne de 7 exercices (10–12 min)
- Corrige le syndrome croisé supérieur (cou en avant, épaules enroulées)
- Renforcement du cou dans 3 directions pour les collisions rugby
- Instructions détaillées + où sentir l'effort

### Profil
- Poids actuel / objectif, taille
- Configuration Deezer (URL playlist + nom affiché)
- Objectifs nutritionnels personnalisables
- Notifications de rappel avant séances salle
- Notes et mémos globaux
- Export JSON horodaté, import fusionner ou remplacer

---

## Programme d'entraînement

| Jour | Type | Heure | Exercices |
|------|------|-------|-----------|
| Lundi | Rugby | 17h30–19h | Club |
| Mardi | Force Lower | Matin/midi | Squat · RDL · Hip thrust · Bulgarian · Box jump · Nordic curl |
| Mercredi | Rugby | 17h30–19h | Club |
| Jeudi | Rugby | 17h30–19h | Club |
| Vendredi | Force Upper | Matin/midi | Bench · Pull-up · OHP · Row · Dips · Face pull · Farmer carry |
| Samedi | Full Body | Matin | Deadlift · Push press · Jump squat · Fente · Planche · Core |
| Dimanche | Repos actif | — | Mobilité, posture |

---

## Intelligence artificielle

### Prédiction des poids (par série)

Pour chaque exercice, l'algorithme combine 5 facteurs :

1. **Lissage exponentiel (α=0.35)** sur les 6 dernières séances
2. **Vélocité** — rythme moyen de progression observé
3. **Ajustement RPE** — ≤6 (trop facile) → augmente plus vite · ≥8.5 (trop dur) → ralentit
4. **Multiplicateur fatigue** — fatigue > 7/10 → charges légèrement réduites
5. **Arrondi à la granularité** de chaque exercice (2.5kg pour les grands mouvements)

Pour les patterns (pyramide, montée, descente, drop set), chaque série est calculée individuellement autour du poids de base prédit.

### 1RM — Formule d'Epley

Le 1RM (1 Repetition Maximum) est le poids maximum théorique que tu pourrais soulever une seule fois. Il se calcule depuis tes séries normales :

```
1RM estimé = poids × (1 + reps / 30)
```

Exemple : 60kg × 8 reps → 1RM ≈ 76kg. Formule standard validée pour les plages 2–12 reps.

### Indices athlétiques

Calculés par pondération des performances sur la base des corrélations publiées :

| Indice | Exercices principaux | Référence |
|--------|---------------------|-----------|
| Vitesse | Squat sauté, box jump, deadlift | Wisloff et al. 2004 |
| Accélération 0–10m | Squat barre, hip thrust, bulgarian | McBride et al. 2009 |
| Force explosive | Push press, jump squat | Haff & Nimphius 2012 |
| Endurance | Volume cumulé, farmer carry, core | — |
| Résistance blessures | Nordic curl, face pull, core | Arnason et al. 2008 |
| Impact contact | Bench, row, OHP, core | — |

Ces indices sont des estimations par corrélation. Pour la vitesse réelle : onglet Sprints + chronomètre physique.

### Analyse IA des notes

Chaque fiche exercice peut générer une analyse basée sur tes 8 dernières notes et 5 dernières séances via l'API Claude. Résultat : conseil technique ciblé + recommandation concrète pour la prochaine séance. Cache 6h pour limiter les appels.

---

## Nutrition

### Objectifs par défaut

| Macro | Cible | Justification |
|-------|-------|---------------|
| Calories | 3 100 kcal | Surplus ~350 kcal/j pour prise de masse |
| Protéines | 140g | ~2g/kg de poids cible |
| Glucides | 420g | ~6g/kg pour l'entraînement et le rugby |
| Lipides | 70g | ~1g/kg pour l'équilibre hormonal |

Modifiables dans Profil → Objectifs nutrition.

### Aliments pré-configurés (avec macros exactes)

Œuf entier · Saumon cuit · Blanc de poulet · Riz cuit · Patate douce  
Skyr nature · Yaourt grec 0% · Banane · Flocons d'avoine · Pain complet · Amandes · Avocat

---

## Données et sauvegarde

Toutes les données sont stockées en `localStorage` sous la clé `rugby_v3`. Elles ne quittent jamais l'appareil sauf les appels API optionnels (Open Food Facts, Claude).

**Export** : Profil → Données → Exporter → `rugby-perf-YYYY-MM-DD.json`  
Contient : profil, historique séances, logs poids, notes exercices, nutrition, chronos sprint.

**Import Fusionner** : ajoute les nouvelles données sans écraser l'existant  
**Import Remplacer** : restauration complète depuis un fichier de sauvegarde

Recommandation : exporter une fois par semaine et sauvegarder dans iCloud ou Notes.

---

## Architecture technique

```
index.html  (~160Ko brut · ~40Ko gzippé)
│
├── <style>        Variables CSS, 50+ composants, animations (thème sombre)
│
└── <script>       Tout le JavaScript inline
    ├── EXERCISES          20 exercices (muscles, cues techniques, vidéos, params IA)
    ├── WEEKLY_PROGRAM     Programme semaine + métadonnées
    ├── POSTURE_ROUTINE    7 exercices quotidiens
    ├── Storage            localStorage CRUD, merge, import/export
    ├── Notif              Notifications web push
    ├── AI                 Prédiction EMA, RPE, fatigue, indices athlétiques 1RM
    ├── ExerciseAnimations SVG stick figure animé 60fps (8 exercices clés)
    ├── AnimController     Gestionnaire requestAnimationFrame
    ├── Stats Engine       calc1RM, groupes musculaires, projections athlétiques
    └── App                98 fonctions — navigation, pages, session, nutrition, UI
```

### Dépendances CDN

| Lib | Version | Usage |
|-----|---------|-------|
| Chart.js | 4.4.0 | Tous les graphiques |
| Google Fonts | — | Bebas Neue + DM Sans |
| Open Food Facts API | — | Recherche aliments |
| Anthropic API | claude-sonnet-4 | Analyse notes IA |

Zéro framework · Zéro bundler · JavaScript vanilla

### Compatibilité

| Environnement | Support |
|---|---|
| iOS 16+ Safari | Complet — installation PWA, hors-ligne |
| iOS Chrome / Firefox | Partiel — fonctionne, pas d'installation écran d'accueil |
| Android Chrome | Complet — installation PWA disponible |
| Desktop Chrome / Firefox / Safari | Complet |

Fonctionne hors-ligne : saisie et consultation. Nécessite internet : Open Food Facts, vidéos YouTube, analyse IA notes.

### Tests automatisés

37 tests couvrant :
- Moteur de calcul (1RM, nutrition, algorithme de prédiction)
- Rendu de toutes les pages et onglets
- Flux de séance complet (démarrage → validation séries → fin)
- Import / export des données avec cas d'erreur
- Indices athlétiques et projections sur 8 semaines

---

## Notes scientifiques

**Prise de masse** : surplus ~350 kcal/j + 2g/kg protéines + entraînement progressif → environ 0.3–0.5kg par semaine avec ~70% de masse maigre. C'est le rythme optimal pour un athlète souhaitant minimiser la prise de graisse.

**Œufs** : les méta-analyses récentes portant sur plus d'1.7 million de participants ne montrent aucune association entre 1–2 œufs par jour et les maladies cardiovasculaires chez l'adulte sain sans antécédents.

**Protéines** : les études sur athlètes confirment l'absence d'effets néfastes à 2–3g/kg sur des reins fonctionnellement normaux. La recommandation de 0.8g/kg est un minimum pour la population sédentaire, pas un maximum.

**Créatine monohydrate** : plus de 500 études publiées. +5–10% de force, meilleure récupération inter-séances. Aucun effet secondaire démontré à 3–5g/jour chez un sujet sain. Supplément le plus étudié en nutrition sportive.

**Posture** : le syndrome croisé supérieur (Janda, 1979) se corrige par renforcement des fléchisseurs cervicaux profonds et des rhomboïdes + étirement pectoraux et SCM. Efficacité confirmée par essais contrôlés randomisés de niveau 1b. Facteur aggravant principal : téléphone tête baissée (~27kg de pression sur la nuque pour 1h d'utilisation en regard vers le bas).

**Vitesse et accélération** : la corrélation entre force au squat et vitesse de sprint est documentée depuis les travaux de Wisloff et al. (2004) sur joueurs de football professionnel. La corrélation est particulièrement forte pour l'accélération 0–10m (départ arrêté), qualité clé pour un demi de mêlée.

---

*Développée avec Claude (Anthropic) · 37/37 tests · Données 100% locales · Aucun abonnement*
