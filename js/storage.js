// Storage Engine — localStorage with versioning
const Storage = {
  VERSION: '1.0',
  KEY: 'rugby_perf_v1',

  get() {
    try {
      const raw = localStorage.getItem(this.KEY);
      return raw ? JSON.parse(raw) : this.defaultState();
    } catch { return this.defaultState(); }
  },

  save(state) {
    try { localStorage.setItem(this.KEY, JSON.stringify(state)); return true; }
    catch { return false; }
  },

  defaultState() {
    return {
      version: this.VERSION,
      profile: { weight: 65, targetWeight: 70, startDate: new Date().toISOString() },
      weightLog: [{ date: new Date().toISOString(), weight: 65 }],
      sessionLogs: [],
      fatigue: 5,
      memos: [],
      notifications: { enabled: false, reminders: [] }
    };
  },

  logSession(sessionData) {
    const state = this.get();
    state.sessionLogs.unshift({ ...sessionData, id: Date.now(), date: new Date().toISOString() });
    if (state.sessionLogs.length > 100) state.sessionLogs = state.sessionLogs.slice(0, 100);
    this.save(state);
  },

  logWeight(weight) {
    const state = this.get();
    state.weightLog.push({ date: new Date().toISOString(), weight });
    state.profile.weight = weight;
    this.save(state);
  },

  getExerciseHistory(exerciseId) {
    const state = this.get();
    const logs = [];
    for (const session of state.sessionLogs) {
      const ex = (session.exercises || []).find(e => e.id === exerciseId);
      if (ex) logs.push({ weight: ex.weight || 0, rpe: ex.rpe || 7, completed: ex.completed, date: session.date });
    }
    return logs.reverse();
  },

  setFatigue(score) {
    const state = this.get();
    state.fatigue = score;
    this.save(state);
  },

  getFatigueScore() {
    return this.get().fatigue || 5;
  },

  addMemo(text) {
    const state = this.get();
    state.memos.unshift({ text, date: new Date().toISOString(), id: Date.now() });
    this.save(state);
  }
};

// Notifications Engine
const Notifications = {
  async requestPermission() {
    if (!('Notification' in window)) return false;
    const result = await Notification.requestPermission();
    return result === 'granted';
  },

  schedule(title, body, delayMs) {
    if (Notification.permission !== 'granted') return;
    setTimeout(() => new Notification(title, { body, icon: '/icon.png', badge: '/icon.png' }), delayMs);
  },

  scheduleWeeklyReminders(gymDays) {
    // gymDays: array of {day: 0-6, hour: int, minute: int}
    if (Notification.permission !== 'granted') return;
    const now = new Date();
    gymDays.forEach(({ day, hour, label }) => {
      const next = new Date(now);
      const daysUntil = (day - now.getDay() + 7) % 7 || 7;
      next.setDate(now.getDate() + daysUntil);
      next.setHours(hour - 1, 0, 0, 0);
      const delay = next - now;
      if (delay > 0) {
        this.schedule(`💪 Séance ${label} dans 1h`, 'Prépare ta tenue, mange si besoin.', delay);
      }
    });
  }
};
