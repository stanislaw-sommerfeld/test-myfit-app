// AI Progression Engine
// Uses exponential smoothing + velocity tracking + fatigue modeling

const AIEngine = {

  // Predict next session weight for an exercise
  predictWeight(exerciseId, history) {
    const ex = EXERCISES[exerciseId];
    if (!history || history.length === 0) return ex.baseWeight;

    const recent = history.slice(-8);
    if (recent.length < 2) {
      return recent.length === 1 ? recent[0].weight + ex.progressionRate : ex.baseWeight;
    }

    // Exponential smoothing on weight progression
    const alpha = 0.3;
    let smoothed = recent[0].weight;
    for (let i = 1; i < recent.length; i++) {
      smoothed = alpha * recent[i].weight + (1 - alpha) * smoothed;
    }

    // Velocity: average weekly gain
    const firstW = recent[0].weight, lastW = recent[recent.length - 1].weight;
    const sessions = recent.length;
    const velocity = sessions > 1 ? (lastW - firstW) / (sessions - 1) : ex.progressionRate;

    // Performance score from last 3 sessions
    const last3 = recent.slice(-3);
    const avgRpe = last3.reduce((s, r) => s + (r.rpe || 7), 0) / last3.length;
    const avgCompletion = last3.reduce((s, r) => s + (r.completed ? 1 : 0), 0) / last3.length;

    // Fatigue adjustment
    const fatigueScore = Storage.getFatigueScore();
    const fatigueMultiplier = fatigueScore > 7 ? 0.95 : fatigueScore > 5 ? 1.0 : 1.05;

    // RPE-based adjustment
    let rpeMultiplier = 1.0;
    if (avgRpe <= 6) rpeMultiplier = 1.08; // too easy → increase more
    else if (avgRpe <= 7.5) rpeMultiplier = 1.04; // optimal
    else if (avgRpe <= 8.5) rpeMultiplier = 1.0; // hard but ok
    else rpeMultiplier = 0.95; // too hard → back off

    // Completion rate adjustment
    const completionMultiplier = avgCompletion >= 0.8 ? 1.0 : 0.9;

    const predicted = smoothed + velocity * rpeMultiplier * fatigueMultiplier * completionMultiplier;
    const rounded = Math.round(predicted / ex.progressionRate) * ex.progressionRate;
    return Math.max(ex.baseWeight, rounded);
  },

  // Predict weight progression for next N sessions
  predictFuture(exerciseId, history, sessionsAhead = 8) {
    const points = [];
    const fakeHistory = [...(history || [])];

    for (let i = 0; i < sessionsAhead; i++) {
      const w = this.predictWeight(exerciseId, fakeHistory);
      points.push({ session: i + 1, weight: w, predicted: true });
      fakeHistory.push({ weight: w, rpe: 7, completed: true, date: new Date() });
    }
    return points;
  },

  // Generate weekly load analysis
  analyzeWeekLoad(weekLogs) {
    if (!weekLogs || weekLogs.length === 0) return { load: 0, recommendation: 'Commence le suivi pour des recommandations personnalisées.' };

    const totalVolume = weekLogs.reduce((s, log) => {
      return s + (log.exercises || []).reduce((es, ex) => {
        return es + (ex.weight || 0) * (parseInt(ex.reps) || 0) * (parseInt(ex.sets) || 0);
      }, 0);
    }, 0);

    const avgRpe = weekLogs.reduce((s, l) => s + (l.sessionRpe || 7), 0) / weekLogs.length;

    let recommendation = '';
    if (avgRpe > 8.5) recommendation = 'Semaine chargée — réduis les charges de 10% la semaine prochaine (deload).';
    else if (avgRpe > 7.5) recommendation = 'Bonne intensité — maintiens les charges, ajoute une série si tu te sens bien.';
    else if (avgRpe < 6) recommendation = 'Séances trop faciles — augmente les charges de 5-10%.';
    else recommendation = 'Progression optimale — continue sur cette trajectoire.';

    return { totalVolume, avgRpe: avgRpe.toFixed(1), recommendation };
  },

  // Smart deload detection
  shouldDeload(history) {
    if (!history || history.length < 6) return false;
    const recent = history.slice(-6);
    const highRpe = recent.filter(s => (s.sessionRpe || 7) >= 8.5).length;
    const incomplete = recent.filter(s => !s.completed).length;
    return highRpe >= 3 || incomplete >= 2;
  },

  // Body weight projection
  projectBodyWeight(currentWeight, targetWeight, weeklyCalorieSurplus = 350) {
    const kgPerWeek = weeklyCalorieSurplus / 7700 * 7;
    const weeksNeeded = Math.ceil((targetWeight - currentWeight) / kgPerWeek);
    const points = [];
    for (let w = 0; w <= weeksNeeded + 2; w++) {
      points.push({
        week: w,
        weight: Math.min(targetWeight + 0.5, currentWeight + w * kgPerWeek),
        projected: true
      });
    }
    return { points, weeksNeeded, kgPerWeek: kgPerWeek.toFixed(2) };
  }
};
