const EXERCISES = {
  "squat-barre": {
    name: "Squat barre (back squat)",
    category: "force",
    muscles: ["Quadriceps", "Fessiers", "Ischio-jambiers", "Core"],
    primaryMuscle: "Quadriceps",
    feel: "Tu dois sentir l'effort principalement dans les cuisses et les fessiers. Si tu sens surtout le bas du dos, tu te penches trop en avant.",
    cues: ["Pieds largeur d'épaules, légèrement ouverts (15-30°)", "Barre sur les trapèzes, pas la nuque", "Descendre comme si tu t'asseyais sur une chaise derrière toi", "Genoux dans l'alignement des orteils", "Remonter en poussant le sol vers le bas"],
    videoUrl: "https://www.youtube.com/embed/ultWZbUMPL8",
    sets: "4", reps: "5", rest: 180, tempo: "3-1-X",
    baseWeight: 40, progressionRate: 2.5
  },
  "rdl": {
    name: "Romanian Deadlift",
    category: "force",
    muscles: ["Ischio-jambiers", "Fessiers", "Érecteurs spinaux", "Core"],
    primaryMuscle: "Ischio-jambiers",
    feel: "Tu dois sentir un étirement profond à l'arrière des cuisses. Le bas du dos travaille en stabilisation — pas en moteur principal.",
    cues: ["Barre près du corps tout au long du mouvement", "Hanches reculent en premier (hip hinge)", "Dos plat, regard vers le bas", "Descendre jusqu'à sentir l'étirement des ischios", "Pousser les hanches vers l'avant pour remonter"],
    videoUrl: "https://www.youtube.com/embed/JCXUYuzwNrM",
    sets: "3", reps: "8", rest: 120, tempo: "3-1-2",
    baseWeight: 30, progressionRate: 2.5
  },
  "hip-thrust": {
    name: "Hip thrust (barre)",
    category: "force",
    muscles: ["Fessiers", "Ischio-jambiers", "Core"],
    primaryMuscle: "Fessiers",
    feel: "L'effort doit être concentré à 90% dans les fessiers. Pince les fessiers en haut du mouvement.",
    cues: ["Haut du dos appuyé sur le banc (omoplates)", "Barre sur les hanches avec protection", "Pieds à plat, genoux à 90° en haut", "Pousser à travers les talons", "Garder le menton rentré, ne pas creuser le dos"],
    videoUrl: "https://www.youtube.com/embed/SEdqd1n0cvg",
    sets: "3", reps: "10", rest: 90, tempo: "2-1-2",
    baseWeight: 20, progressionRate: 2.5
  },
  "bulgarian-squat": {
    name: "Bulgarian split squat",
    category: "force",
    muscles: ["Quadriceps", "Fessiers", "Hip flexors", "Équilibre"],
    primaryMuscle: "Quadriceps",
    feel: "Quadriceps de la jambe avant + fessier. Si tu sens surtout le hip flexor de la jambe arrière, tu es trop loin du banc.",
    cues: ["Pied arrière sur le banc (dessus du pied)", "Pied avant à ~70cm du banc", "Descendre verticalement, genou avant au-dessus de la cheville", "Torse légèrement incliné vers l'avant", "Ne pas laisser le genou partir vers l'intérieur"],
    videoUrl: "https://www.youtube.com/embed/2C-uNgKwPLE",
    sets: "3", reps: "8/jambe", rest: 90, tempo: "2-0-2",
    baseWeight: 0, progressionRate: 2.5
  },
  "box-jump": {
    name: "Box jump",
    category: "puissance",
    muscles: ["Quadriceps", "Fessiers", "Mollets", "Système nerveux"],
    primaryMuscle: "Chaîne complète",
    feel: "Explosion totale. Atterrissage silencieux = bonne technique. Si tu fais du bruit, tu n'absorbes pas correctement.",
    cues: ["Position de départ : demi-squat, bras en arrière", "Bras vers l'avant en même temps que le saut", "Atterrir en squat léger, pas jambes tendues", "Descendre de la box en pas, ne pas sauter en arrière", "Qualité > vitesse — repos complet entre chaque"],
    videoUrl: "https://www.youtube.com/embed/52r_Ul5k03g",
    sets: "4", reps: "5", rest: 120, tempo: "Explosif",
    baseWeight: 0, progressionRate: 0
  },
  "nordic-curl": {
    name: "Nordic curl (ischio-jambiers)",
    category: "force",
    muscles: ["Ischio-jambiers", "Fessiers", "Core"],
    primaryMuscle: "Ischio-jambiers",
    feel: "Brûlure intense à l'arrière des cuisses pendant la descente. C'est normal. C'est le mouvement excentrique le plus efficace pour les ischios.",
    cues: ["Genoux sur un coussin ou tapis plié", "Quelqu'un tient les chevilles ou bloquer sous un meuble lourd", "Descendre LE PLUS LENTEMENT POSSIBLE (objectif 6-8s)", "Utiliser les mains pour l'atterrissage au sol", "Remontée : aide avec les bras, pas de triche"],
    videoUrl: "https://www.youtube.com/embed/d1CIV3SXEAY",
    sets: "3", reps: "6", rest: 120, tempo: "4-0-1",
    baseWeight: 0, progressionRate: 0
  },
  "bench-press": {
    name: "Développé couché barre",
    category: "force",
    muscles: ["Pectoraux", "Triceps", "Épaules antérieures"],
    primaryMuscle: "Pectoraux",
    feel: "L'effort doit être ressenti dans les pectoraux, pas les épaules. Si les épaules dominent, ta prise est trop serrée.",
    cues: ["Prise légèrement plus large que les épaules", "Omoplates serrées et abaissées (pas haussées)", "Pieds à plat au sol", "Descendre la barre vers le milieu du sternum", "Pousser en arc (pas verticalement)"],
    videoUrl: "https://www.youtube.com/embed/rT7DgCr-3pg",
    sets: "4", reps: "6", rest: 180, tempo: "3-1-X",
    baseWeight: 30, progressionRate: 2.5
  },
  "tractions": {
    name: "Tractions (pull-up)",
    category: "force",
    muscles: ["Grand dorsal", "Biceps", "Rhomboïdes", "Trapèze moyen"],
    primaryMuscle: "Grand dorsal",
    feel: "L'effort doit venir du dos, pas des bras. Pense à 'amener les coudes vers les hanches' plutôt que 'tirer avec les mains'.",
    cues: ["Prise légèrement plus large que les épaules", "Commencer en position basse, bras tendus", "Omoplates vers le bas avant de tirer", "Menton au-dessus de la barre", "Descente lente et contrôlée (3 secondes)"],
    videoUrl: "https://www.youtube.com/embed/eGo4IYlbE5g",
    sets: "4", reps: "6-8", rest: 120, tempo: "2-1-3",
    baseWeight: 0, progressionRate: 0
  },
  "overhead-press": {
    name: "Développé militaire debout",
    category: "force",
    muscles: ["Deltoïdes antérieurs et médians", "Triceps", "Core", "Trapèze"],
    primaryMuscle: "Épaules",
    feel: "Épaules et triceps. Le core travaille en stabilisation — si tu creuses le dos, ton core lâche.",
    cues: ["Prise largeur d'épaules, coudes légèrement devant la barre", "Rentrer la tête en passant la barre (pas incliner le corps)", "Verrouiller les coudes en haut", "Abdos contractés tout au long", "Barre descend vers la clavicule"],
    videoUrl: "https://www.youtube.com/embed/2yjwXTZQDDI",
    sets: "3", reps: "8", rest: 120, tempo: "2-1-2",
    baseWeight: 20, progressionRate: 1.25
  },
  "rowing-barre": {
    name: "Rowing barre (Barbell row)",
    category: "force",
    muscles: ["Grand dorsal", "Rhomboïdes", "Biceps", "Érecteurs spinaux"],
    primaryMuscle: "Grand dorsal",
    feel: "Le dos doit être le moteur, les bras les câbles. Pince les omoplates ensemble en fin de mouvement.",
    cues: ["Torse à ~45° (presque horizontal)", "Dos plat, regard vers le sol devant toi", "Tirer vers le bas du ventre (pas la poitrine)", "Coudes près du corps ou légèrement écartés", "Descente contrôlée, ne pas laisser tomber"],
    videoUrl: "https://www.youtube.com/embed/kBWAon7ItDw",
    sets: "3", reps: "8", rest: 120, tempo: "2-1-2",
    baseWeight: 30, progressionRate: 2.5
  },
  "dips": {
    name: "Dips lestés",
    category: "force",
    muscles: ["Pectoraux bas", "Triceps", "Épaules antérieures"],
    primaryMuscle: "Triceps / Pectoraux bas",
    feel: "Inclinaison vers l'avant = plus de pectoraux. Torse vertical = plus de triceps. Commence sans lest.",
    cues: ["Monter sur les barres, bras tendus", "Descendre jusqu'à ce que les épaules soient en dessous des coudes", "Ne pas laisser les épaules monter vers les oreilles", "Pousser vers le haut et légèrement vers l'avant", "Contrôler la descente (2-3 secondes)"],
    videoUrl: "https://www.youtube.com/embed/2z8JmcrW-As",
    sets: "3", reps: "10", rest: 90, tempo: "2-1-2",
    baseWeight: 0, progressionRate: 2.5
  },
  "face-pull": {
    name: "Face pull (poulie haute)",
    category: "posture",
    muscles: ["Deltoïdes postérieurs", "Rhomboïdes", "Trapèze moyen", "Rotateurs externes"],
    primaryMuscle: "Épaule postérieure",
    feel: "L'arrière des épaules et entre les omoplates. Indispensable pour corriger la posture et protéger les épaules.",
    cues: ["Corde attachée à une poulie haute", "Tirer vers le visage en écartant les mains", "Coudes à hauteur d'épaules ou plus haut", "Finir avec les pouces pointant derrière toi", "Mouvement lent et contrôlé, pas d'élan"],
    videoUrl: "https://www.youtube.com/embed/rep-qVOkqgk",
    sets: "3", reps: "15", rest: 60, tempo: "2-2-2",
    baseWeight: 10, progressionRate: 1.25
  },
  "farmer-carry": {
    name: "Farmer carry (marche lestée)",
    category: "force",
    muscles: ["Trapèzes", "Avant-bras", "Core", "Tout le corps"],
    primaryMuscle: "Trapèzes / Core",
    feel: "Brûlure dans les avant-bras et les trapèzes. Le core lutte contre la rotation. Parfait pour les collisions rugby.",
    cues: ["Haltères lourds dans chaque main", "Torse droit, épaules en arrière et en bas", "Pas normaux, ne pas se dandiner", "Regard droit devant", "Respiration contrôlée — ne pas bloquer"],
    videoUrl: "https://www.youtube.com/embed/Fkzk_RqlYig",
    sets: "3", reps: "20m", rest: 90, tempo: "Continu",
    baseWeight: 16, progressionRate: 2
  },
  "deadlift": {
    name: "Deadlift (soulevé de terre)",
    category: "force",
    muscles: ["Ischio-jambiers", "Fessiers", "Érecteurs spinaux", "Trapèzes", "Core"],
    primaryMuscle: "Chaîne postérieure complète",
    feel: "TOUT le corps travaille. Le dos ne doit jamais s'arrondir. L'effort est dans les jambes qui poussent le sol, pas dans le dos qui tire.",
    cues: ["Barre sur le milieu du pied (à 2cm des tibias)", "Prise un peu plus large que les épaules", "Hanches vers le bas avant de tirer (pas un squat, pas un bon du matin)", "Dos plat, regard légèrement vers le bas", "Pousser le sol — ne pas penser 'tirer la barre'"],
    videoUrl: "https://www.youtube.com/embed/op9kVnSso6Q",
    sets: "4", reps: "4", rest: 240, tempo: "2-1-X",
    baseWeight: 50, progressionRate: 5
  },
  "push-press": {
    name: "Push press (poussé-jeté)",
    category: "puissance",
    muscles: ["Épaules", "Triceps", "Quadriceps", "Core"],
    primaryMuscle: "Épaules / puissance",
    feel: "Un dip rapide avec les jambes donne l'élan, les épaules finissent. Mouvement explosif et athlétique.",
    cues: ["Barre sur les clavicules, coudes devant", "Léger dip (quart de squat) puis EXPLOSION vers le haut", "Bras verrouillés en haut", "Réceptionner en position stable", "Plus d'élan = moins d'épaules = tricher"],
    videoUrl: "https://www.youtube.com/embed/iaBVSJm78ko",
    sets: "4", reps: "5", rest: 180, tempo: "X",
    baseWeight: 20, progressionRate: 1.25
  },
  "jump-squat": {
    name: "Jump squat lesté",
    category: "puissance",
    muscles: ["Quadriceps", "Fessiers", "Mollets", "Système nerveux"],
    primaryMuscle: "Chaîne extensrice",
    feel: "Atterrissage amorti = bonne technique. Commence léger (10-20kg barre) pour maîtriser l'atterrissage.",
    cues: ["Descente rapide à mi-squat (pas full squat)", "Explosion maximale vers le haut", "Atterrissage sur la plante des pieds, puis talons", "Genoux fléchis à l'atterrissage (absorbent le choc)", "Repos complet entre chaque rep"],
    videoUrl: "https://www.youtube.com/embed/CVaEhXotL7M",
    sets: "4", reps: "4", rest: 180, tempo: "X",
    baseWeight: 10, progressionRate: 2.5
  },
  "lunge-marche": {
    name: "Fente marchée lestée",
    category: "force",
    muscles: ["Quadriceps", "Fessiers", "Hip flexors", "Équilibre"],
    primaryMuscle: "Quadriceps / Fessiers",
    feel: "Quadriceps de la jambe avant + fessier. Le tronc doit rester vertical tout au long.",
    cues: ["Grand pas vers l'avant", "Genou avant s'arrête à 90°, ne dépasse pas le pied", "Genou arrière effleure le sol (sans poser)", "Pousser sur le talon avant pour avancer", "Haltères dans les mains ou barre sur le dos"],
    videoUrl: "https://www.youtube.com/embed/L8fvypPrzzs",
    sets: "3", reps: "12/jambe", rest: 90, tempo: "2-0-2",
    baseWeight: 8, progressionRate: 2
  },
  "planche": {
    name: "Planche (plank)",
    category: "core",
    muscles: ["Core (transverse)", "Épaules", "Fessiers", "Quadriceps"],
    primaryMuscle: "Core",
    feel: "Tout le corps est en tension. Le ventre doit être rentré (pas bombé). Si tes hanches tombent, tu as lâché.",
    cues: ["Coudes sous les épaules", "Corps en ligne droite de la tête aux talons", "Rentrer légèrement le ventre", "Serrer les fessiers", "Respirer normalement — ne pas bloquer"],
    videoUrl: "https://www.youtube.com/embed/pSHjTRCQxIw",
    sets: "3", reps: "60s", rest: 30, tempo: "Statique",
    baseWeight: 0, progressionRate: 0
  },
  "russian-twist": {
    name: "Russian twist lesté",
    category: "core",
    muscles: ["Obliques", "Transverse", "Hip flexors"],
    primaryMuscle: "Obliques",
    feel: "Les obliques sur les côtés du ventre. Si tu sens le bas du dos, tes pieds sont trop bas et ton dos se courbe.",
    cues: ["Assis, dos à 45°, pieds légèrement levés", "Tenir un poids avec les deux mains", "Rotation vient des épaules, pas des hanches", "Toucher le sol de chaque côté", "Mouvements contrôlés, pas rapides"],
    videoUrl: "https://www.youtube.com/embed/JyUqwkVpsi8",
    sets: "3", reps: "20", rest: 60, tempo: "2-0-2",
    baseWeight: 5, progressionRate: 1.25
  },
  "pallof-press": {
    name: "Pallof press (anti-rotation)",
    category: "core",
    muscles: ["Core (anti-rotation)", "Obliques", "Épaules", "Fessiers"],
    primaryMuscle: "Core anti-rotation",
    feel: "La résistance rotatoire que tu dois contrer. Les abdos résistent à la torsion — exactement comme lors d'un plaquage.",
    cues: ["Debout de côté par rapport à la poulie", "Corde/poignée à la hauteur du sternum", "Pousser les bras devant toi et tenir", "Ne pas laisser le corps tourner vers la poulie", "Revenir lentement"],
    videoUrl: "https://www.youtube.com/embed/AH_QZLm_0-s",
    sets: "3", reps: "12/côté", rest: 60, tempo: "2-3-2",
    baseWeight: 8, progressionRate: 1.25
  }
};

const WEEKLY_PROGRAM = [
  {
    day: 0, name: "Lundi", label: "Rugby",
    type: "rugby", color: "#e8a020",
    time: "17h30–19h",
    note: "Entraînement club — arrive reposé, bien nourri 2h avant.",
    exercises: []
  },
  {
    day: 1, name: "Mardi", label: "Force Lower",
    type: "gym", color: "#1D9E75",
    time: "Matin ou midi",
    note: "Lendemain de rugby — priorité à la chaîne postérieure et explosivité.",
    exercises: ["squat-barre","rdl","hip-thrust","bulgarian-squat","box-jump","nordic-curl"]
  },
  {
    day: 2, name: "Mercredi", label: "Rugby",
    type: "rugby", color: "#e8a020",
    time: "17h30–19h",
    note: "Entraînement club — léger le matin, récup active si besoin.",
    exercises: []
  },
  {
    day: 3, name: "Jeudi", label: "Rugby",
    type: "rugby", color: "#e8a020",
    time: "17h30–19h",
    note: "3e séance rugby de la semaine — repose-toi bien la nuit précédente.",
    exercises: []
  },
  {
    day: 4, name: "Vendredi", label: "Force Upper",
    type: "gym", color: "#1D9E75",
    time: "Matin ou midi",
    note: "Lendemain du dernier rugby — haut du corps + posture.",
    exercises: ["bench-press","tractions","overhead-press","rowing-barre","dips","face-pull","farmer-carry"]
  },
  {
    day: 5, name: "Samedi", label: "Full Body",
    type: "gym", color: "#185FA5",
    time: "Matin",
    note: "Séance complète athlétique — mouvements composés et puissance.",
    exercises: ["deadlift","push-press","jump-squat","lunge-marche","planche","russian-twist","pallof-press"]
  },
  {
    day: 6, name: "Dimanche", label: "Repos actif",
    type: "rest", color: "#888780",
    time: "Quand tu veux",
    note: "Mobilité, posture, marche. La récupération c'est là que tu progresses.",
    exercises: []
  }
];

const POSTURE_ROUTINE = [
  { name: "Chin tuck", duration: "3×10 (tenir 10s)", muscles: ["Fléchisseurs cervicaux profonds"], feel: "Sous le menton et à l'arrière du cou", instruction: "Allongé sur le dos, rentrer le menton vers la nuque sans lever la tête. Double menton visible." },
  { name: "Wall angel", duration: "3×10", muscles: ["Rhomboïdes", "Trapèze moyen", "Épaules"], feel: "Entre les omoplates et arrière des bras", instruction: "Dos et nuque collés au mur, bras à 90°. Faire glisser les bras vers le haut en gardant tout en contact avec le mur." },
  { name: "Rétraction scapulaire", duration: "3×15 (tenir 5s)", muscles: ["Rhomboïdes", "Trapèze moyen"], feel: "Entre les deux omoplates", instruction: "Debout, serrer les omoplates comme pour tenir un crayon entre elles. Épaules restent basses." },
  { name: "Étirement SCM", duration: "3×30s/côté", muscles: ["Sterno-cléido-mastoïdien"], feel: "Sur le côté du cou", instruction: "Incliner la tête sur le côté et légèrement tourner vers le haut. Maintenir sans forcer." },
  { name: "Étirement pectoraux", duration: "3×30s/côté", muscles: ["Pectoraux", "Épaule antérieure"], feel: "Avant de l'épaule et pectoral", instruction: "Bras à 90° appuyé sur un chambranle. Tourner doucement le corps vers l'autre côté." },
  { name: "Cat-cow", duration: "2×10 lents", muscles: ["Thoracique", "Lombaires"], feel: "Toute la colonne", instruction: "À 4 pattes. Dos rond (cat) en expirant, dos creux (cow) en inspirant. Lentement." },
  { name: "Résistance manuelle cou (3 directions)", duration: "3×10 chaque", muscles: ["Tous les fléchisseurs et extenseurs cervicaux"], feel: "Cou dans la direction opposée à la résistance", instruction: "Main sur le front (frontal), la tempe (latéral) ou derrière la tête (arrière). Résister avec le cou, tenir 5s." }
];

if (typeof module !== 'undefined') module.exports = { EXERCISES, WEEKLY_PROGRAM, POSTURE_ROUTINE };
