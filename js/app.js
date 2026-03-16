// ===== APP STATE =====
let currentPage = 'home';
let currentSession = null;
let sessionExerciseLogs = {};
let charts = {};
let activeDay = new Date().getDay();

// ===== NAVIGATION =====
function navigate(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const el = document.getElementById('page-' + page);
  if (el) el.classList.add('active');
  const nav = document.querySelector(`.nav-item[data-page="${page}"]`);
  if (nav) nav.classList.add('active');
  currentPage = page;
  if (page === 'home') renderHome();
  if (page === 'program') renderProgram();
  if (page === 'stats') renderStats();
  if (page === 'posture') renderPosture();
  if (page === 'profile') renderProfile();
  window.scrollTo(0, 0);
}

// ===== HOME PAGE =====
function renderHome() {
  const state = Storage.get();
  const today = new Date();
  const dayIdx = today.getDay() === 0 ? 6 : today.getDay() - 1;
  const todayProgram = WEEKLY_PROGRAM[dayIdx];
  const weight = state.profile.weight;
  const target = state.profile.targetWeight;
  const toGain = (target - weight).toFixed(1);
  const pct = Math.min(100, Math.round(((weight - 65) / (target - 65)) * 100));

  const doneSessions = state.sessionLogs.filter(s => {
    const d = new Date(s.date);
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + 1);
    return d >= weekStart;
  }).length;

  const fatigueScore = state.fatigue || 5;
  const fatigueLabel = fatigueScore <= 3 ? 'Frais 💪' : fatigueScore <= 6 ? 'Normal 😐' : 'Fatigué 😴';
  const deload = AIEngine.shouldDeload(state.sessionLogs);

  let html = `
  <div class="page-header">
    <div class="page-title">RUGBY PERF</div>
    <div class="page-sub">${today.toLocaleDateString('fr-FR', {weekday:'long', day:'numeric', month:'long'})}</div>
  </div>
  <div style="padding:0 16px">

    ${deload ? `<div class="notif-banner" onclick="showDeloadInfo()">
      <span style="font-size:18px">⚠️</span>
      <span class="notif-text">Semaine de deload recommandée — charges élevées détectées</span>
    </div>` : ''}

    <div class="stats-row stats-row-3" style="margin-bottom:12px">
      <div class="stat-box">
        <div class="stat-val">${weight.toFixed(1)}</div>
        <div class="stat-lbl">kg actuels</div>
      </div>
      <div class="stat-box">
        <div class="stat-val" style="color:var(--accent)">${toGain}</div>
        <div class="stat-lbl">kg à gagner</div>
      </div>
      <div class="stat-box">
        <div class="stat-val">${doneSessions}<span style="font-size:16px;color:var(--text2)">/6</span></div>
        <div class="stat-lbl">séances sem.</div>
      </div>
    </div>

    <div class="card" style="margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
        <span style="font-size:13px;font-weight:500">Objectif 70kg</span>
        <span style="font-size:13px;color:var(--accent)">${pct}%</span>
      </div>
      <div class="prog-bar-bg"><div class="prog-bar-fill" style="width:${pct}%"></div></div>
    </div>

    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
        <span style="font-size:13px;font-weight:500">Fatigue aujourd'hui</span>
        <span style="font-size:13px;color:var(--text2)">${fatigueLabel}</span>
      </div>
      <div class="fatigue-track" id="fatigue-track"></div>
      <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text3);margin-top:4px">
        <span>Frais</span><span>Normal</span><span>Épuisé</span>
      </div>
    </div>

    <div class="card">
      <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Aujourd'hui</div>
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <div style="font-size:16px;font-weight:500">${todayProgram.label}</div>
          <div style="font-size:12px;color:var(--text2);margin-top:2px">${todayProgram.time} ${todayProgram.note.slice(0,50)}...</div>
        </div>
        <span class="badge ${todayProgram.type === 'rugby' ? 'badge-orange' : todayProgram.type === 'gym' ? 'badge-green' : 'badge-gray'}">${todayProgram.type}</span>
      </div>
      ${todayProgram.type === 'gym' ? `<button class="btn btn-primary btn-full" style="margin-top:12px" onclick="startSession(${dayIdx})">Démarrer la séance →</button>` : ''}
    </div>

    <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px;margin-top:4px">Cette semaine</div>`;

  // Week strip
  html += '<div class="week-strip">';
  WEEKLY_PROGRAM.forEach((d, i) => {
    const done = state.sessionLogs.some(s => {
      const sDate = new Date(s.date);
      const weekStart = new Date(today); weekStart.setDate(today.getDate() - ((today.getDay()+6)%7));
      weekStart.setHours(0,0,0,0);
      return sDate >= weekStart && s.dayIndex === i;
    });
    const isToday = i === dayIdx;
    html += `<div class="week-day ${isToday?'active':''} ${d.type==='rugby'?'rugby':''} ${done?'done':''}" onclick="navigate('program');selectDay(${i})">
      <div class="week-day-name">${d.name.slice(0,3)}</div>
      <div class="week-day-label" style="font-size:8px">${d.label.slice(0,6)}</div>
    </div>`;
  });
  html += '</div></div>';

  document.getElementById('page-home').innerHTML = html;
  renderFatigueTrack(fatigueScore);
}

function renderFatigueTrack(current) {
  const track = document.getElementById('fatigue-track');
  if (!track) return;
  let html = '';
  for (let i = 1; i <= 10; i++) {
    const cls = i <= current ? (i <= 4 ? 'active-low' : i <= 7 ? 'active-mid' : 'active-high') : '';
    html += `<div class="fatigue-dot ${cls}" onclick="setFatigue(${i})"></div>`;
  }
  track.innerHTML = html;
}

function setFatigue(score) {
  Storage.setFatigue(score);
  renderFatigueTrack(score);
}

// ===== PROGRAM PAGE =====
let selectedDayIdx = 0;

function selectDay(idx) {
  selectedDayIdx = idx;
  renderProgram();
}

function renderProgram() {
  const state = Storage.get();
  const day = WEEKLY_PROGRAM[selectedDayIdx];
  let html = `
  <div class="page-header">
    <div class="page-title">PROGRAMME</div>
    <div class="page-sub">Semaine type — Rugby Lun/Mer/Jeu 17h30</div>
  </div>
  <div class="week-strip">`;

  WEEKLY_PROGRAM.forEach((d, i) => {
    html += `<div class="week-day ${i===selectedDayIdx?'active':''} ${d.type==='rugby'?'rugby':''}" onclick="selectDay(${i})">
      <div class="week-day-name">${d.name.slice(0,3)}</div>
      <div class="week-day-label" style="font-size:8px">${d.type==='gym'?'💪':d.type==='rugby'?'🏉':'😴'}</div>
    </div>`;
  });

  html += `</div><div style="padding:0 16px">
  <div class="card">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
      <div>
        <div style="font-size:20px;font-weight:600">${day.name}</div>
        <div style="font-size:13px;color:var(--text2)">${day.label} · ${day.time}</div>
      </div>
      <span class="badge ${day.type==='rugby'?'badge-orange':day.type==='gym'?'badge-green':'badge-gray'}">${day.type}</span>
    </div>
    <div style="font-size:13px;color:var(--text2);border-left:3px solid var(--accent);padding-left:10px;border-radius:0 4px 4px 0">${day.note}</div>
  </div>`;

  if (day.type === 'rugby') {
    html += `<div class="card">
      <div style="font-size:15px;font-weight:500;margin-bottom:8px">🏉 Entraînement rugby club</div>
      <div style="font-size:13px;color:var(--text2);line-height:1.6">
        Arriver bien nourri 2h avant (glucides + protéines).<br>
        Hydratation : 500ml d'eau dans les 2h précédentes.<br>
        Après la séance : collation protéinée dans les 30min.<br><br>
        <strong style="color:var(--text)">Nutrition pré-séance :</strong> riz + poulet ou pain complet + jambon + banane.
      </div>
    </div>`;
  } else if (day.type === 'rest') {
    html += `<div class="card">
      <div style="font-size:15px;font-weight:500;margin-bottom:8px">😌 Récupération active</div>
      <div style="font-size:13px;color:var(--text2);line-height:1.6">
        Marche 30–45 min · Routine posture (onglet dédié)<br>
        Mobilité hanches, ischio, épaules<br>
        Rouleau de massage si disponible<br>
        <strong style="color:var(--text)">Priorité absolue : 8h de sommeil</strong>
      </div>
    </div>`;
  } else {
    // Gym day — show exercises with predictions
    html += `<button class="btn btn-primary btn-full" style="margin-bottom:12px" onclick="startSession(${selectedDayIdx})">🏋 Démarrer cette séance</button>`;
    day.exercises.forEach(exId => {
      const ex = EXERCISES[exId];
      if (!ex) return;
      const history = Storage.getExerciseHistory(exId);
      const predicted = AIEngine.predictWeight(exId, history);
      const lastWeight = history.length > 0 ? history[history.length-1].weight : null;
      html += `<div class="card" onclick="showExerciseDetail('${exId}')" style="cursor:pointer">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
          <div style="flex:1">
            <div class="ex-name">${ex.name}</div>
            <div class="ex-meta">${ex.sets} séries × ${ex.reps} · repos ${ex.rest}s · tempo ${ex.tempo}</div>
            <div class="ex-predicted">🤖 IA prédit : ${predicted > 0 ? predicted + ' kg' : 'poids du corps'}</div>
            <div class="muscle-list" style="margin-top:6px">
              ${ex.muscles.map(m => `<span class="muscle-tag ${m===ex.primaryMuscle?'muscle-primary':''}">${m}</span>`).join('')}
            </div>
          </div>
          <div style="text-align:right;margin-left:8px">
            ${lastWeight ? `<div style="font-size:12px;color:var(--text3)">Dernier</div><div style="font-size:16px;font-weight:600;color:var(--text2)">${lastWeight}kg</div>` : ''}
            <div style="font-size:12px;color:var(--text3);margin-top:4px">Détails →</div>
          </div>
        </div>
      </div>`;
    });
  }

  html += '</div>';
  document.getElementById('page-program').innerHTML = html;
}

// ===== SESSION ACTIVE =====
function startSession(dayIdx) {
  const day = WEEKLY_PROGRAM[dayIdx];
  if (!day.exercises.length) return;
  currentSession = { dayIdx, startTime: Date.now(), exercises: day.exercises };
  sessionExerciseLogs = {};
  renderActiveSession();
  navigate('session');
}

function renderActiveSession() {
  if (!currentSession) return;
  const day = WEEKLY_PROGRAM[currentSession.dayIdx];
  let html = `
  <div class="page-header">
    <div class="page-title">${day.label.toUpperCase()}</div>
    <div class="page-sub" id="session-timer-display">En cours...</div>
  </div>
  <div style="padding:0 16px">`;

  day.exercises.forEach((exId, idx) => {
    const ex = EXERCISES[exId];
    if (!ex) return;
    const history = Storage.getExerciseHistory(exId);
    const predicted = AIEngine.predictWeight(exId, history);
    const log = sessionExerciseLogs[exId] || {};

    html += `<div class="card" id="ex-card-${exId}">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">
        <div>
          <div class="ex-name">${ex.name}</div>
          <div class="ex-meta">${ex.sets} × ${ex.reps} · repos ${ex.rest}s</div>
        </div>
        <button onclick="showExerciseDetail('${exId}')" class="btn btn-outline btn-sm">Guide</button>
      </div>
      <div class="pred-card" style="padding:12px;margin-bottom:10px">
        <div style="font-size:11px;color:var(--text2);margin-bottom:2px">🤖 Poids recommandé par IA</div>
        <div style="font-size:24px;font-family:var(--font-display);color:var(--accent)">${predicted > 0 ? predicted + ' kg' : 'Poids du corps'}</div>
      </div>
      <div class="input-row" style="margin-bottom:8px">
        <div>
          <div style="font-size:11px;color:var(--text3);margin-bottom:4px">Poids utilisé (kg)</div>
          <input class="input" type="number" step="0.5" value="${log.weight || (predicted > 0 ? predicted : '')}" placeholder="${predicted > 0 ? predicted : '—'}" onchange="logExWeight('${exId}', this.value)" id="weight-${exId}">
        </div>
        <div>
          <div style="font-size:11px;color:var(--text3);margin-bottom:4px">Reps réalisées</div>
          <input class="input" type="number" value="${log.reps || ''}" placeholder="${ex.reps}" onchange="logExReps('${exId}', this.value)" id="reps-${exId}">
        </div>
      </div>
      <div style="margin-bottom:8px">
        <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text3);margin-bottom:4px">
          <span>Difficulté perçue (RPE)</span>
          <span id="rpe-val-${exId}">${log.rpe || 7}/10</span>
        </div>
        <input type="range" class="rpe-slider" min="1" max="10" value="${log.rpe || 7}" oninput="logExRpe('${exId}', this.value)" id="rpe-${exId}">
        <div class="rpe-labels"><span>Facile</span><span>Optimal</span><span>Maximum</span></div>
      </div>
      <button class="btn btn-full ${log.completed ? 'btn-primary' : 'btn-outline'}" onclick="toggleExComplete('${exId}')">
        ${log.completed ? '✓ Exercice terminé' : 'Marquer terminé'}
      </button>
    </div>`;
  });

  html += `<div style="margin-top:8px;padding-bottom:16px">
    <div style="font-size:13px;color:var(--text2);margin-bottom:8px">Difficulté globale de la séance</div>
    <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text3);margin-bottom:4px">
      <span>RPE session</span><span id="session-rpe-val">7/10</span>
    </div>
    <input type="range" class="rpe-slider" min="1" max="10" value="7" id="session-rpe" oninput="document.getElementById('session-rpe-val').textContent=this.value+'/10'">
    <button class="btn btn-primary btn-full" style="margin-top:12px" onclick="finishSession()">Terminer la séance ✓</button>
    <button class="btn btn-outline btn-full" style="margin-top:8px" onclick="navigate('home')">Abandonner</button>
  </div></div>`;

  const page = document.getElementById('page-session');
  if (page) page.innerHTML = html;

  // Start timer
  clearInterval(window._sessionTimer);
  window._sessionTimer = setInterval(() => {
    if (!currentSession) return;
    const elapsed = Math.floor((Date.now() - currentSession.startTime) / 1000);
    const m = Math.floor(elapsed / 60), s = elapsed % 60;
    const el = document.getElementById('session-timer-display');
    if (el) el.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')} en cours`;
  }, 1000);
}

function logExWeight(id, val) { if (!sessionExerciseLogs[id]) sessionExerciseLogs[id] = {}; sessionExerciseLogs[id].weight = parseFloat(val); }
function logExReps(id, val) { if (!sessionExerciseLogs[id]) sessionExerciseLogs[id] = {}; sessionExerciseLogs[id].reps = val; }
function logExRpe(id, val) {
  if (!sessionExerciseLogs[id]) sessionExerciseLogs[id] = {};
  sessionExerciseLogs[id].rpe = parseInt(val);
  const el = document.getElementById('rpe-val-' + id);
  if (el) el.textContent = val + '/10';
}
function toggleExComplete(id) {
  if (!sessionExerciseLogs[id]) sessionExerciseLogs[id] = {};
  sessionExerciseLogs[id].completed = !sessionExerciseLogs[id].completed;
  const btn = document.querySelector(`#ex-card-${id} .btn`);
  if (btn) {
    btn.textContent = sessionExerciseLogs[id].completed ? '✓ Exercice terminé' : 'Marquer terminé';
    btn.className = `btn btn-full ${sessionExerciseLogs[id].completed ? 'btn-primary' : 'btn-outline'}`;
  }
}

function finishSession() {
  if (!currentSession) return;
  clearInterval(window._sessionTimer);
  const sessionRpe = parseInt(document.getElementById('session-rpe')?.value || 7);
  const exercises = currentSession.exercises.map(exId => ({
    id: exId,
    weight: (sessionExerciseLogs[exId] || {}).weight || 0,
    reps: (sessionExerciseLogs[exId] || {}).reps || '',
    rpe: (sessionExerciseLogs[exId] || {}).rpe || 7,
    completed: (sessionExerciseLogs[exId] || {}).completed || false
  }));
  Storage.logSession({
    dayIndex: currentSession.dayIdx,
    dayLabel: WEEKLY_PROGRAM[currentSession.dayIdx].label,
    duration: Math.floor((Date.now() - currentSession.startTime) / 60000),
    sessionRpe, exercises, completed: true
  });
  currentSession = null;
  sessionExerciseLogs = {};
  navigate('home');
}

// ===== EXERCISE DETAIL SHEET =====
function showExerciseDetail(exId) {
  const ex = EXERCISES[exId];
  if (!ex) return;
  const history = Storage.getExerciseHistory(exId);
  const predicted = AIEngine.predictWeight(exId, history);
  const future = AIEngine.predictFuture(exId, history, 6);

  let videoHtml = '';
  if (ex.videoUrl) {
    videoHtml = `<div class="video-wrap">
      <div class="video-placeholder" id="vph-${exId}" onclick="loadVideo('${exId}','${ex.videoUrl}')">
        <div class="video-play-btn"><svg viewBox="0 0 24 24" fill="white" width="20" height="20"><path d="M8 5v14l11-7z"/></svg></div>
        <div style="font-size:12px;color:var(--text2)">Voir la démonstration vidéo</div>
      </div>
      <iframe id="vid-${exId}" style="display:none" allowfullscreen allow="autoplay"></iframe>
    </div>`;
  }

  const sheet = document.getElementById('exercise-sheet');
  const content = document.getElementById('exercise-sheet-content');
  content.innerHTML = `
    <div class="sheet-handle"></div>
    <div class="sheet-title">${ex.name}</div>
    <div class="sheet-sub">${ex.sets} séries × ${ex.reps} · Repos ${ex.rest}s · Tempo ${ex.tempo}</div>

    ${videoHtml}

    <div style="margin-bottom:12px">
      <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">Muscles travaillés</div>
      <div class="muscle-list">
        ${ex.muscles.map(m=>`<span class="muscle-tag ${m===ex.primaryMuscle?'muscle-primary':''}">${m}${m===ex.primaryMuscle?' ★':''}</span>`).join('')}
      </div>
    </div>

    <div class="feel-box" style="margin-bottom:12px">
      <div style="font-size:11px;color:var(--accent);font-weight:600;margin-bottom:4px">OÙ SENTIR L'EFFORT</div>
      <p>${ex.feel}</p>
    </div>

    <div style="margin-bottom:12px">
      <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Points techniques clés</div>
      <ul class="cue-list">
        ${ex.cues.map(c=>`<li>${c}</li>`).join('')}
      </ul>
    </div>

    <div class="pred-card" style="margin-bottom:12px">
      <div style="font-size:11px;color:var(--text2);margin-bottom:4px">🤖 Prédiction IA — prochaine séance</div>
      <div class="pred-weight">${predicted > 0 ? predicted + ' kg' : 'Poids du corps'}</div>
      ${history.length > 0 ? `<div class="pred-delta">↑ ${predicted - (history[history.length-1]?.weight||0) > 0 ? '+' : ''}${(predicted - (history[history.length-1]?.weight||0)).toFixed(1)} kg vs dernière fois</div>` : ''}
      <div style="margin-top:8px;font-size:11px;color:var(--text3)">Progression prévue sur 6 séances :</div>
      <div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap">
        ${future.map((f,i)=>`<span style="background:rgba(29,158,117,${0.1+i*0.1});color:var(--accent);padding:3px 8px;border-radius:99px;font-size:11px">S${i+1}: ${f.weight > 0 ? f.weight+'kg' : 'BW'}</span>`).join('')}
      </div>
    </div>

    ${history.length > 0 ? `<div style="margin-bottom:12px">
      <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Historique</div>
      ${history.slice(-5).reverse().map(h=>`
        <div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:0.5px solid var(--border)">
          <span style="font-size:12px;color:var(--text2)">${new Date(h.date).toLocaleDateString('fr-FR')}</span>
          <div style="display:flex;gap:12px">
            <span style="font-size:12px;color:var(--text)">${h.weight > 0 ? h.weight+'kg' : 'BW'}</span>
            <span style="font-size:12px;color:var(--text3)">RPE ${h.rpe}</span>
            <span style="font-size:12px;color:${h.completed?'var(--accent)':'var(--red)'}">${h.completed?'✓':'✗'}</span>
          </div>
        </div>`).join('')}
    </div>` : ''}

    <button class="btn btn-outline btn-full" onclick="closeSheet('exercise-sheet')">Fermer</button>
  `;
  sheet.classList.add('open');
}

function loadVideo(exId, url) {
  document.getElementById('vph-'+exId).style.display = 'none';
  const iframe = document.getElementById('vid-'+exId);
  iframe.style.display = 'block';
  iframe.src = url + '?autoplay=1&rel=0';
}

function closeSheet(id) {
  document.getElementById(id).classList.remove('open');
}

// ===== STATS PAGE =====
function renderStats() {
  const state = Storage.get();
  const weights = state.weightLog || [];
  const sessions = state.sessionLogs || [];
  const analysis = AIEngine.analyzeWeekLoad(sessions.slice(0, 6));
  const bodyProj = AIEngine.projectBodyWeight(state.profile.weight, state.profile.targetWeight);

  let html = `
  <div class="page-header">
    <div class="page-title">STATS</div>
    <div class="page-sub">Progression & prédictions IA</div>
  </div>
  <div style="padding:0 16px">

    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
        <span style="font-size:13px;font-weight:500">Poids corporel</span>
        <div style="display:flex;gap:8px">
          <input type="number" step="0.1" class="input" style="width:80px;padding:6px 8px;font-size:13px" placeholder="65.0" id="weight-input-stats">
          <button class="btn btn-sm btn-primary" onclick="saveWeight()">+</button>
        </div>
      </div>
      <div class="chart-wrap" style="height:180px"><canvas id="chart-weight"></canvas></div>
      <div style="font-size:12px;color:var(--accent);margin-top:4px">
        🤖 Objectif 70kg atteint dans ~${bodyProj.weeksNeeded} semaines (${bodyProj.kgPerWeek}kg/sem)
      </div>
    </div>

    <div class="card">
      <div style="font-size:13px;font-weight:500;margin-bottom:4px">Analyse de charge — semaine</div>
      <div style="font-size:12px;color:var(--text2);margin-bottom:8px">RPE moyen : ${analysis.avgRpe || '—'}</div>
      <div class="feel-box"><p>${analysis.recommendation}</p></div>
    </div>

    <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Progression par exercice</div>`;

  const gymDays = WEEKLY_PROGRAM.filter(d => d.type === 'gym');
  gymDays.forEach(day => {
    day.exercises.slice(0, 3).forEach(exId => {
      const ex = EXERCISES[exId];
      const hist = Storage.getExerciseHistory(exId);
      if (!ex) return;
      const predicted = AIEngine.predictWeight(exId, hist);
      const lastW = hist.length > 0 ? hist[hist.length-1].weight : ex.baseWeight;
      html += `<div class="card-sm" style="margin-bottom:8px;cursor:pointer" onclick="showExerciseDetail('${exId}')">
        <div style="display:flex;justify-content:space-between">
          <span style="font-size:13px;font-weight:500">${ex.name}</span>
          <span style="font-size:11px;color:var(--text3)">${day.label}</span>
        </div>
        <div style="display:flex;gap:16px;margin-top:6px">
          <div><div style="font-size:10px;color:var(--text3)">Actuel</div><div style="font-size:16px;font-weight:600">${lastW > 0 ? lastW+'kg' : 'BW'}</div></div>
          <div><div style="font-size:10px;color:var(--text3)">IA prédit</div><div style="font-size:16px;font-weight:600;color:var(--accent)">${predicted > 0 ? predicted+'kg' : 'BW'}</div></div>
          <div style="flex:1"><div style="font-size:10px;color:var(--text3);margin-bottom:4px">Séances tracées</div>
            <div class="prog-bar-bg"><div class="prog-bar-fill" style="width:${Math.min(100,hist.length*10)}%"></div></div>
            <div style="font-size:10px;color:var(--text3);margin-top:2px">${hist.length} séances</div>
          </div>
        </div>
      </div>`;
    });
  });

  html += `<div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px;margin-top:4px">Dernières séances</div>`;
  sessions.slice(0, 5).forEach(s => {
    html += `<div class="card-sm" style="margin-bottom:8px">
      <div style="display:flex;justify-content:space-between">
        <span style="font-size:13px;font-weight:500">${s.dayLabel}</span>
        <span style="font-size:12px;color:var(--text3)">${new Date(s.date).toLocaleDateString('fr-FR')}</span>
      </div>
      <div style="display:flex;gap:12px;margin-top:4px">
        <span style="font-size:12px;color:var(--text2)">${s.duration || '?'} min</span>
        <span style="font-size:12px;color:${s.sessionRpe > 8 ? 'var(--red)' : s.sessionRpe < 6 ? 'var(--accent)' : 'var(--text2)'}">RPE ${s.sessionRpe}</span>
        <span style="font-size:12px;color:var(--accent)">${(s.exercises||[]).filter(e=>e.completed).length}/${(s.exercises||[]).length} ex. complétés</span>
      </div>
    </div>`;
  });

  html += '</div>';
  document.getElementById('page-stats').innerHTML = html;

  // Draw weight chart
  setTimeout(() => {
    const ctx = document.getElementById('chart-weight');
    if (!ctx || typeof Chart === 'undefined') return;
    if (charts.weight) charts.weight.destroy();
    const labels = weights.map(w => new Date(w.date).toLocaleDateString('fr-FR', {day:'2-digit',month:'2-digit'}));
    const data = weights.map(w => w.weight);
    // Add projection
    const proj = bodyProj.points.slice(1, 5);
    const projLabels = proj.map((_, i) => `+${i+1}sem`);
    const projData = proj.map(p => p.weight);
    charts.weight = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [...labels, ...projLabels],
        datasets: [
          { label: 'Poids réel', data: [...data, ...Array(projLabels.length).fill(null)], borderColor: '#1D9E75', backgroundColor: 'rgba(29,158,117,0.1)', pointRadius: 4, tension: 0.3, fill: true },
          { label: 'Projection IA', data: [...Array(data.length).fill(null), data[data.length-1], ...projData], borderColor: '#378ADD', borderDash: [5,5], pointRadius: 3, tension: 0.3, fill: false },
          { label: 'Objectif', data: Array(labels.length + projLabels.length).fill(70), borderColor: '#e8a020', borderDash: [3,3], pointRadius: 0, borderWidth: 1 }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#8a8a92', font: { size: 10 } } } },
        scales: {
          y: { min: 63, max: 72, ticks: { color: '#5a5a62', font: { size: 10 }, callback: v => v+'kg' }, grid: { color: 'rgba(255,255,255,0.04)' } },
          x: { ticks: { color: '#5a5a62', font: { size: 9 } }, grid: { display: false } }
        }
      }
    });
  }, 100);
}

function saveWeight() {
  const val = parseFloat(document.getElementById('weight-input-stats')?.value);
  if (!val || val < 40 || val > 200) return;
  Storage.logWeight(val);
  renderStats();
}

// ===== POSTURE PAGE =====
function renderPosture() {
  let html = `
  <div class="page-header">
    <div class="page-title">POSTURE</div>
    <div class="page-sub">Routine quotidienne — cou, dos, scapulaires</div>
  </div>
  <div style="padding:0 16px">
    <div class="card" style="background:var(--accent-dim);border-color:var(--accent)">
      <div style="font-size:13px;color:var(--accent);font-weight:500;margin-bottom:4px">10–12 min par jour</div>
      <div style="font-size:12px;color:var(--accent);opacity:0.8">Matin ou avant l'entraînement. Ces exercices corrigent le syndrome croisé supérieur (cou en avant, épaules enroulées).</div>
    </div>`;

  POSTURE_ROUTINE.forEach((ex, i) => {
    html += `<div class="card">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
        <div>
          <div style="font-size:15px;font-weight:500">${ex.name}</div>
          <div style="font-size:12px;color:var(--accent);margin-top:2px">${ex.duration}</div>
        </div>
        <span style="background:var(--surface2);color:var(--text3);padding:4px 8px;border-radius:99px;font-size:11px">${i+1}/${POSTURE_ROUTINE.length}</span>
      </div>
      <div class="muscle-list">
        ${ex.muscles.map(m=>`<span class="muscle-tag">${m}</span>`).join('')}
      </div>
      <div class="feel-box" style="margin:8px 0">
        <div style="font-size:10px;font-weight:600;color:var(--accent);margin-bottom:2px">OÙ SENTIR</div>
        <p style="font-size:12px">${ex.feel}</p>
      </div>
      <div style="font-size:12px;color:var(--text2);line-height:1.6">${ex.instruction}</div>
    </div>`;
  });

  html += `<div class="card">
    <div style="font-size:15px;font-weight:500;margin-bottom:8px">📱 Règle du quotidien</div>
    <div style="font-size:13px;color:var(--text2);line-height:1.7">
      Téléphone tenu à la hauteur des yeux, pas vers le bas.<br>
      1h de téléphone tête baissée = 27kg de pression sur la nuque.<br>
      Écran d'ordinateur au niveau des yeux.<br>
      <strong style="color:var(--text)">C'est 70% du travail de correction.</strong>
    </div>
  </div></div>`;
  document.getElementById('page-posture').innerHTML = html;
}

// ===== PROFILE PAGE =====
function renderProfile() {
  const state = Storage.get();
  const notifGranted = Notification.permission === 'granted';
  html = `
  <div class="page-header">
    <div class="page-title">PROFIL</div>
    <div class="page-sub">Paramètres & notifications</div>
  </div>
  <div style="padding:0 16px">
    <div class="card">
      <div style="font-size:13px;font-weight:500;margin-bottom:12px">Mon profil</div>
      <div class="input-row" style="margin-bottom:8px">
        <div><div style="font-size:11px;color:var(--text3);margin-bottom:4px">Poids actuel (kg)</div>
          <input class="input" type="number" step="0.1" value="${state.profile.weight}" id="prof-weight"></div>
        <div><div style="font-size:11px;color:var(--text3);margin-bottom:4px">Objectif (kg)</div>
          <input class="input" type="number" step="0.1" value="${state.profile.targetWeight}" id="prof-target"></div>
      </div>
      <button class="btn btn-primary btn-full btn-sm" onclick="saveProfile()">Enregistrer</button>
    </div>

    <div class="card">
      <div style="font-size:13px;font-weight:500;margin-bottom:8px">Notifications</div>
      <div style="font-size:12px;color:var(--text2);margin-bottom:10px">Rappels 1h avant tes séances de salle (Mardi, Vendredi, Samedi)</div>
      <button class="btn btn-full ${notifGranted ? 'btn-outline' : 'btn-primary'} btn-sm" onclick="setupNotifications()">
        ${notifGranted ? '✓ Notifications activées' : 'Activer les rappels de séance'}
      </button>
    </div>

    <div class="card">
      <div style="font-size:13px;font-weight:500;margin-bottom:8px">Notes & mémos</div>
      <textarea class="input" rows="3" placeholder="Ex: Sprint 10m en 1.72s, squat 80kg..." id="memo-input" style="resize:none;margin-bottom:8px"></textarea>
      <button class="btn btn-outline btn-full btn-sm" onclick="saveMemo()">Ajouter une note</button>
      <div id="memo-list" style="margin-top:10px"></div>
    </div>

    <div class="card">
      <div style="font-size:13px;font-weight:500;margin-bottom:4px">Comment déployer cette app</div>
      <div style="font-size:12px;color:var(--text2);line-height:1.7;margin-bottom:8px">
        1. Va sur <strong style="color:var(--text)">github.com</strong> → New repository<br>
        2. Upload tous les fichiers de l'app<br>
        3. Settings → Pages → Branch: main<br>
        4. Ton URL : <strong style="color:var(--accent)">ton-pseudo.github.io/rugby-perf</strong><br>
        5. Sur iPhone : Safari → Partager → "Sur l'écran d'accueil"
      </div>
    </div>

    <div class="card">
      <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Données</div>
      <button class="btn btn-outline btn-full btn-sm" onclick="exportData()" style="margin-bottom:8px">Exporter mes données (JSON)</button>
      <button class="btn btn-outline btn-full btn-sm" style="color:var(--red);border-color:var(--red)" onclick="if(confirm('Effacer toutes les données ?'))resetData()">Réinitialiser les données</button>
    </div>
  </div>`;
  document.getElementById('page-profile').innerHTML = html;
  renderMemoList();
}

function saveProfile() {
  const state = Storage.get();
  state.profile.weight = parseFloat(document.getElementById('prof-weight').value) || state.profile.weight;
  state.profile.targetWeight = parseFloat(document.getElementById('prof-target').value) || state.profile.targetWeight;
  Storage.save(state);
  alert('Profil enregistré ✓');
}

async function setupNotifications() {
  const granted = await Notifications.requestPermission();
  if (granted) {
    Notifications.scheduleWeeklyReminders([
      { day: 2, hour: 9, label: 'Force Lower Body' },
      { day: 5, hour: 9, label: 'Force Upper Body' },
      { day: 6, hour: 9, label: 'Full Body' }
    ]);
    renderProfile();
  }
}

function saveMemo() {
  const val = document.getElementById('memo-input')?.value?.trim();
  if (!val) return;
  Storage.addMemo(val);
  document.getElementById('memo-input').value = '';
  renderMemoList();
}

function renderMemoList() {
  const list = document.getElementById('memo-list');
  if (!list) return;
  const memos = Storage.get().memos || [];
  list.innerHTML = memos.slice(0, 5).map(m => `
    <div style="padding:8px 0;border-bottom:0.5px solid var(--border)">
      <div style="font-size:11px;color:var(--text3)">${new Date(m.date).toLocaleDateString('fr-FR')}</div>
      <div style="font-size:13px;color:var(--text2);margin-top:2px">${m.text}</div>
    </div>`).join('');
}

function exportData() {
  const data = Storage.get();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'rugby-perf-data.json'; a.click();
}

function resetData() { localStorage.removeItem(Storage.KEY); location.reload(); }
function showDeloadInfo() { alert('Semaine de deload : réduis toutes les charges de 10%, garde les séries/reps identiques. Cela permet à ton système nerveux de récupérer et de progresser encore plus fort la semaine suivante.'); }

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  navigate('home');
});
