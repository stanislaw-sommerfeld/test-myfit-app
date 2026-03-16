// ===== GLOBALS =====
let curPage='home', curSession=null, curDayIdx=0, sheetExId=null, sheetMediaMode='anim';
let charts={};
let restTimerObj={interval:null,remaining:0,total:0};
let chronoObj={interval:null,elapsed:0,running:false};
let sessionTimer=null;
let nutritionState=null; // today's nutrition object

// ===== UTILS =====
function haptic(t='light'){if(navigator.vibrate){const p={light:[8],medium:[18],heavy:[28,8,28],success:[8,40,8]};navigator.vibrate(p[t]||[8]);}}

function toast(msg,type='success',dur=2500){
  const c={success:'#1D9E75',error:'#e05252',info:'#378ADD',warn:'#e8a020'};
  let el=document.getElementById('_toast');if(!el){el=document.createElement('div');el.id='_toast';document.body.appendChild(el);}
  el.className='toast';el.style.background=c[type]||c.success;el.style.color='#fff';el.textContent=msg;
  requestAnimationFrame(()=>{el.style.opacity='1';el.style.transform='translateX(-50%) translateY(0)';});
  clearTimeout(el._t);el._t=setTimeout(()=>{el.style.opacity='0';el.style.transform='translateX(-50%) translateY(10px)';},dur);
}

function fmt(n){return n!=null?Number(n).toFixed(1):'';}
function fmtTime(s){return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');}
function fmtDate(iso){return new Date(iso).toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit'});}
function today(){return new Date().toDateString();}

// ===== NAVIGATION =====
function nav(page){
  if(page!=='session'){AnimController?.stopAll();}
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  const el=document.getElementById('page-'+page);
  if(el)el.classList.add('active');
  const ni=document.querySelector(`.nav-item[data-page="${page}"]`);
  if(ni)ni.classList.add('active');
  curPage=page;
  const renders={home:renderHome,program:renderProgram,stats:renderStats,posture:renderPosture,nutrition:renderNutrition,profile:renderProfile};
  if(renders[page])renders[page]();
  window.scrollTo({top:0,behavior:'instant'});
}

// ===== HOME =====
function renderHome(){
  const s=Storage.get();
  const d=new Date();
  const dayIdx=d.getDay()===0?6:d.getDay()-1;
  const todayP=WEEKLY_PROGRAM[dayIdx];
  const w=s.profile.weight, tgt=s.profile.targetWeight;
  const pct=Math.max(0,Math.min(100,Math.round(((w-65)/(tgt-65))*100)));
  const toGain=Math.max(0,tgt-w).toFixed(1);
  const weekStart=new Date(d);weekStart.setDate(d.getDate()-((d.getDay()+6)%7));weekStart.setHours(0,0,0,0);
  const doneSess=s.sessionLogs.filter(x=>new Date(x.date)>=weekStart).length;
  const wLog=s.weightLog;const wDelta=wLog.length>=2?(wLog[wLog.length-1].weight-wLog[wLog.length-2].weight).toFixed(1):null;
  const deload=AI.shouldDeload(s.sessionLogs);
  const fatigue=s.fatigue||5;
  const fatigLabel=fatigue<=3?'Frais 💪':fatigue<=6?'Normal 😐':'Fatigué 😴';

  // Nutrition summary for today
  const todayNut=Storage.getTodayNutrition();
  const nutKcal=todayNut?todayNut.meals.reduce((a,m)=>a+m.items.reduce((b,i)=>b+(i.kcal||0)*((i.qty||100)/100),0),0):0;
  const nutGoal=Storage.getNutritionGoals();

  document.getElementById('page-home').innerHTML=`
  <div class="page-header fade-up">
    <div style="display:flex;justify-content:space-between;align-items:flex-start">
      <div><div class="page-title">RUGBY PERF</div>
      <div class="page-sub">${d.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'})}</div></div>
      ${s.profile.deezerPlaylistUrl?`<button class="btn btn-gold btn-sm" onclick="openDeezer()" style="flex-shrink:0;margin-top:4px">▶ Deezer</button>`:''}
    </div>
  </div>
  <div class="px">
  ${deload?`<div class="card card-gold fade-up" style="cursor:pointer" onclick="showDeloadInfo()">
    <div style="display:flex;align-items:center;gap:10px">
      <span style="font-size:20px">⚠️</span>
      <div><div style="font-size:13px;font-weight:500;color:var(--gold)">Deload recommandé</div>
      <div style="font-size:11px;color:var(--text2)">Charges élevées détectées — réduis de 10%</div></div>
    </div></div>`:''}

  <div class="stats-row stats-3 fade-up">
    <div class="stat-box"><div class="stat-val">${w.toFixed(1)}</div>
      <div class="stat-lbl">kg ${wDelta!=null?`<span style="color:${+wDelta>=0?'var(--accent)':'var(--red)'}">${+wDelta>=0?'+':''}${wDelta}</span>`:''}</div></div>
    <div class="stat-box"><div class="stat-val" style="color:var(--accent)">${toGain}</div><div class="stat-lbl">kg à gagner</div></div>
    <div class="stat-box"><div class="stat-val">${doneSess}<span style="font-size:13px;color:var(--text3)">/6</span></div><div class="stat-lbl">séances sem.</div></div>
  </div>

  <div class="card fade-up" style="animation-delay:.05s">
    <div class="prog-header"><span class="prog-label">Objectif ${tgt}kg</span><span class="prog-val">${pct}%</span></div>
    <div class="prog-bg"><div class="prog-fill" id="weight-fill" style="width:0%"></div></div>
    <div style="display:flex;justify-content:space-between;font-size:9px;color:var(--text3);margin-top:3px"><span>65kg</span><span>${tgt}kg</span></div>
  </div>

  <div class="card fade-up" style="animation-delay:.08s">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
      <span style="font-size:12px;font-weight:500">Fatigue</span>
      <span style="font-size:11px;color:var(--text2)">${fatigLabel}</span>
    </div>
    <div class="fatigue-track" id="fatigue-track"></div>
    <div style="display:flex;justify-content:space-between;font-size:9px;color:var(--text3);margin-top:3px"><span>Frais</span><span>Normal</span><span>Épuisé</span></div>
  </div>

  <div class="card fade-up" style="animation-delay:.11s">
    <div style="font-size:9px;color:var(--text3);text-transform:uppercase;letter-spacing:.8px;margin-bottom:8px">Aujourd'hui</div>
    <div style="display:flex;justify-content:space-between;align-items:center">
      <div><div style="font-size:17px;font-weight:600">${todayP.label}</div>
      <div style="font-size:11px;color:var(--text2);margin-top:2px">${todayP.time}</div></div>
      <span class="badge ${todayP.type==='rugby'?'badge-orange':todayP.type==='gym'?'badge-green':'badge-gray'}">${todayP.type}</span>
    </div>
    ${todayP.type==='gym'?`<button class="btn btn-primary btn-full" style="margin-top:10px" onclick="haptic('medium');startSession(${dayIdx})">Démarrer la séance →</button>`:''}
  </div>

  ${nutKcal>0?`<div class="card fade-up card-interactive" style="animation-delay:.14s" onclick="nav('nutrition')">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
      <span style="font-size:12px;font-weight:500">Nutrition aujourd'hui</span>
      <span style="font-size:11px;color:var(--accent)">${Math.round(nutKcal)} / ${nutGoal.kcal} kcal</span>
    </div>
    <div class="prog-bg"><div class="prog-fill" style="width:${Math.min(100,Math.round(nutKcal/nutGoal.kcal*100))}%"></div></div>
  </div>`:`<div class="card fade-up card-interactive" style="animation-delay:.14s;cursor:pointer" onclick="nav('nutrition')">
    <div style="font-size:12px;color:var(--text3)">🥗 Enregistrer ta nutrition d'aujourd'hui →</div>
  </div>`}

  <div style="font-size:9px;color:var(--text3);text-transform:uppercase;letter-spacing:.8px;margin-bottom:7px">Cette semaine</div>
  <div class="week-strip" id="home-week" style="padding:0"></div>
  </div>`;

  setTimeout(()=>{const f=document.getElementById('weight-fill');if(f)f.style.width=pct+'%';},150);
  buildFatigueTrack(fatigue);
  buildWeekStrip('home-week',dayIdx,Storage.get().sessionLogs,weekStart);
}

function buildFatigueTrack(cur){
  const el=document.getElementById('fatigue-track');if(!el)return;
  el.innerHTML=Array.from({length:10},(_,i)=>{const n=i+1;const c=n<=cur?(n<=4?'f-low':n<=7?'f-mid':'f-high'):'';
    return`<div class="fatigue-dot ${c}" onclick="haptic();setFatigue(${n})"></div>`;}).join('');
}
function setFatigue(n){Storage.setFatigue(n);buildFatigueTrack(n);}

function buildWeekStrip(id,todayIdx,logs,weekStart){
  const el=document.getElementById(id);if(!el)return;
  el.innerHTML=WEEKLY_PROGRAM.map((d,i)=>{
    const done=logs.some(s=>new Date(s.date)>=weekStart&&s.dayIndex===i);
    const isToday=i===todayIdx;
    return`<div class="week-day ${isToday?'today':''} ${d.type==='rugby'?'rugby':''} ${done?'done':''}" onclick="haptic();nav('program');curDayIdx=${i};renderProgram()">
      <div class="week-day-name">${d.name.slice(0,3)}</div>
      <div class="week-day-icon">${done?'✓':d.type==='gym'?'💪':d.type==='rugby'?'🏉':'😴'}</div>
      <div class="week-day-type">${d.label.slice(0,5)}</div>
    </div>`;
  }).join('');
}

// ===== PROGRAM =====
function renderProgram(){
  const d=WEEKLY_PROGRAM[curDayIdx];
  const s=Storage.get();
  const weekStart=new Date();weekStart.setDate(weekStart.getDate()-((new Date().getDay()+6)%7));weekStart.setHours(0,0,0,0);
  const todayIdx=new Date().getDay()===0?6:new Date().getDay()-1;

  let html=`<div class="page-header"><div class="page-title">PROGRAMME</div>
    <div class="page-sub">Rugby Lun/Mer/Jeu 17h30 · Salle Mar/Ven/Sam</div></div>
  <div class="week-strip" id="prog-week" style="margin-bottom:10px"></div>
  <div class="px">
  <div class="card fade-up">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
      <div><div style="font-size:19px;font-weight:600">${d.name}</div>
      <div style="font-size:12px;color:var(--text2)">${d.label} · ${d.time}</div></div>
      <span class="badge ${d.type==='rugby'?'badge-orange':d.type==='gym'?'badge-green':'badge-gray'}">${d.type}</span>
    </div>
    <div style="border-left:3px solid var(--accent);padding:6px 10px;font-size:12px;color:var(--text2);background:var(--accent-dim);border-radius:0 7px 7px 0">${d.note}</div>
  </div>`;

  if(d.type==='gym'){
    // AI session optimization note
    html+=`<div class="ai-insight fade-up" id="ai-session-insight">
      <div class="ai-insight-header"><div class="ai-pulse"></div><span class="ai-title">🤖 Analyse IA de la séance</span></div>
      <div class="ai-text" id="ai-sess-text" style="font-size:12px;color:var(--text3)">Chargement...</div>
    </div>`;
    html+=`<button class="btn btn-primary btn-full fade-up" style="margin-bottom:12px;animation-delay:.05s" onclick="haptic('medium');startSession(${curDayIdx})">🏋 Démarrer cette séance</button>`;
    d.exercises.forEach((exId,i)=>{
      const ex=EXERCISES[exId];if(!ex)return;
      const lastW=Storage.getLastWeight(exId);
      const predSets=AI.predictSets(exId);
      const predMax=predSets.length?Math.max(...predSets.map(s=>s.weight||0)):0;
      html+=`<div class="card card-interactive fade-up" style="animation-delay:${.05+i*.04}s" onclick="haptic();showExDetail('${exId}')">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
          <div style="flex:1">
            <div style="font-size:14px;font-weight:500">${ex.name}</div>
            <div style="font-size:11px;color:var(--text2);margin-top:2px">${ex.sets} séries × ${ex.reps} · ${ex.rest}s · ${ex.tempo}</div>
            <div class="muscle-list">${ex.muscles.map(m=>`<span class="muscle-tag ${m===ex.primaryMuscle?'muscle-primary':''}">${m}</span>`).join('')}</div>
          </div>
          <div style="text-align:right;margin-left:10px;flex-shrink:0">
            <div style="font-size:9px;color:var(--text3)">IA prédit</div>
            <div style="font-family:var(--font-display);font-size:22px;color:var(--accent)">${predMax>0?predMax+'kg':'BW'}</div>
            ${lastW?`<div style="font-size:10px;color:var(--text3)">dernier: ${lastW}kg</div>`:''}
          </div>
        </div>
      </div>`;
    });
  } else if(d.type==='rugby'){
    html+=`<div class="card fade-up">
      <div style="font-size:15px;font-weight:500;margin-bottom:8px">🏉 Entraînement club</div>
      <div style="font-size:13px;color:var(--text2);line-height:1.7">
        <b style="color:var(--text)">2h avant</b> — Riz + poulet ou pain complet + jambon + banane<br>
        <b style="color:var(--text)">Hydratation</b> — 500ml dans les 2h précédentes<br>
        <b style="color:var(--text)">Après</b> — Protéines dans les 30min (skyr + 3g créatine)
      </div>
    </div>`;
  } else {
    html+=`<div class="card fade-up">
      <div style="font-size:15px;font-weight:500;margin-bottom:8px">😌 Récupération active</div>
      <div style="font-size:13px;color:var(--text2);line-height:1.7">
        Marche 30–45 min · Routine posture (onglet dédié)<br>Mobilité hanches, ischio, épaules<br>
        <b style="color:var(--accent)">Priorité : 8h de sommeil</b>
      </div>
    </div>`;
  }
  html+=`</div>`;
  document.getElementById('page-program').innerHTML=html;
  buildWeekStrip('prog-week',todayIdx,Storage.get().sessionLogs,new Date(new Date().setHours(0,0,0,0)-((new Date().getDay()+6)%7)*86400000));
  // Update week strip selection
  setTimeout(()=>{
    const days=document.querySelectorAll('#prog-week .week-day');
    if(days[curDayIdx])days[curDayIdx].classList.add('today');
  },50);

  // Load AI insight async
  if(d.type==='gym'){
    AI.optimizeSession(curDayIdx).then(text=>{
      const el=document.getElementById('ai-sess-text');
      if(el)el.textContent=text||'Accumule des données pour des recommandations personnalisées.';
    });
  }
}

// ===== SESSION =====
function startSession(dayIdx){
  const day=WEEKLY_PROGRAM[dayIdx];
  if(!day.exercises.length)return;
  // Init session state
  curSession={
    dayIdx, startTime:Date.now(),
    exercises:day.exercises.map(exId=>({
      id:exId, pattern:'flat',
      sets:AI.predictSets(exId,'flat'),
      note:'', expanded:false
    }))
  };
  renderSession();
  nav('session');
}

function renderSession(){
  if(!curSession)return;
  const day=WEEKLY_PROGRAM[curSession.dayIdx];
  let html=`
  <div class="page-header">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <div class="page-title" style="font-size:26px">${day.label.toUpperCase()}</div>
      <div style="display:flex;align-items:center;gap:10px">
        <div id="sess-elapsed" style="font-family:var(--font-display);font-size:20px;color:var(--accent)">00:00</div>
        <div style="display:flex;gap:4px">
          ${Storage.get().profile.deezerPlaylistUrl?`<button class="btn btn-gold btn-xs" onclick="openDeezer()">▶</button>`:''}
          <button class="btn btn-outline btn-xs" onclick="haptic();showChronoSheet()">⏱</button>
        </div>
      </div>
    </div>
  </div>
  <div class="px">

  <!-- REST TIMER (sticky) -->
  <div id="rest-bar" class="rest-bar">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px">
      <span style="font-size:12px;color:var(--text2)">Repos en cours</span>
      <div style="display:flex;align-items:center;gap:10px">
        <span id="rest-cd" class="rest-countdown">00:00</span>
        <button class="btn btn-ghost btn-xs" onclick="stopRest()">✕</button>
      </div>
    </div>
    <div class="prog-bg"><div class="rest-bar-fill" id="rest-fill" style="width:100%"></div></div>
    <div style="display:flex;gap:5px;margin-top:6px;justify-content:center">
      ${[30,45,60,90,120,180].map(s=>`<button class="btn btn-xs btn-outline" onclick="startRest(${s})">${s<60?s+'s':s/60+'m'}</button>`).join('')}
    </div>
  </div>`;

  // Exercise cards
  curSession.exercises.forEach((exState,ei)=>{
    const ex=EXERCISES[exState.id];if(!ex)return;
    const allDone=exState.sets.length>0&&exState.sets.every(s=>s.done);
    const doneCnt=exState.sets.filter(s=>s.done).length;
    html+=`<div class="card" id="ex-card-${ei}" style="${allDone?'border-color:rgba(29,158,117,0.3);':''}transition:border-color .2s">
      <!-- Header -->
      <div style="display:flex;justify-content:space-between;align-items:flex-start;cursor:pointer" onclick="toggleExCard(${ei})">
        <div style="flex:1">
          <div style="display:flex;align-items:center;gap:8px">
            <span style="font-size:14px;font-weight:500;${allDone?'color:var(--text2)':''}">${ex.name}</span>
            ${allDone?'<span class="badge badge-green" style="font-size:10px">✓</span>':`<span style="font-size:11px;color:var(--text3)">${doneCnt}/${exState.sets.length}</span>`}
          </div>
          <div style="font-size:11px;color:var(--text3);margin-top:1px">${ex.sets}×${ex.reps} · ${ex.rest}s repos</div>
        </div>
        <div style="display:flex;align-items:center;gap:6px">
          <button class="btn btn-xs btn-outline" onclick="event.stopPropagation();haptic();showExDetail('${exState.id}')">Guide</button>
          <span style="color:var(--text3);font-size:14px">${exState.expanded?'▲':'▼'}</span>
        </div>
      </div>

      ${exState.expanded?`
      <!-- Pattern selector -->
      <div style="margin:10px 0 6px">
        <div class="input-label">Type de progression</div>
        <div class="pattern-chips">
          ${['flat','ascending','descending','pyramid','drop'].map(p=>`<div class="pattern-chip ${exState.pattern===p?'active':''}" onclick="setPattern(${ei},'${p}')">${{flat:'Plat',ascending:'Montée',descending:'Descente',pyramid:'Pyramide',drop:'Drop set'}[p]}</div>`).join('')}
        </div>
      </div>

      <!-- Series table -->
      <div class="series-header">
        <span></span><span>POIDS</span><span>REPS</span><span>RPE</span><span></span>
      </div>
      <div class="series-grid" id="series-grid-${ei}">
        ${exState.sets.map((set,si)=>buildSeriesRow(ei,si,set)).join('')}
      </div>

      <!-- Add/remove series -->
      <div style="display:flex;gap:6px;margin-top:8px">
        <button class="btn btn-outline btn-sm" style="flex:1" onclick="addSet(${ei})">+ Série</button>
        ${exState.sets.length>1?`<button class="btn btn-outline btn-sm" onclick="removeSet(${ei})">− Série</button>`:''}
      </div>

      <!-- Note for this exercise -->
      <div style="margin-top:10px">
        <div class="input-label">Note pour cet exercice</div>
        <textarea class="input input-sm" rows="2" placeholder="Ressenti, technique, douleur..." id="ex-note-${ei}" style="resize:none">${exState.note||''}</textarea>
      </div>

      <!-- Quick rest button -->
      <button class="btn btn-outline btn-full" style="margin-top:8px;gap:6px" onclick="haptic();startRest(${ex.rest})">
        <span>⏱</span> Lancer repos ${ex.rest}s
      </button>
      `:''}
    </div>`;
  });

  // Session RPE + finish
  html+=`
  <div class="card" style="margin-top:6px">
    <div class="input-label" style="margin-bottom:6px">Difficulté globale de la séance</div>
    <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text3);margin-bottom:4px">
      <span>RPE session</span><span id="sess-rpe-val" style="color:var(--accent);font-weight:600">7/10</span>
    </div>
    <input type="range" style="width:100%;accent-color:var(--accent)" min="1" max="10" value="7" id="sess-rpe"
      oninput="document.getElementById('sess-rpe-val').textContent=this.value+'/10'">
    <div style="font-size:11px;color:var(--text3);margin-top:4px">Note globale de séance</div>
    <textarea class="input input-sm" rows="2" placeholder="Points forts, à améliorer, fatigue..." id="sess-global-note" style="resize:none;margin-top:6px"></textarea>
    <button class="btn btn-primary btn-full" style="margin-top:10px" onclick="haptic('success');finishSession()">Terminer la séance ✓</button>
    <button class="btn btn-ghost btn-full btn-sm" style="margin-top:4px;color:var(--text3)" onclick="if(confirm('Abandonner ?')){stopSessionTimer();nav('home')}">Abandonner</button>
  </div></div>`;

  document.getElementById('page-session').innerHTML=html;
  startSessionTimer();
}

function buildSeriesRow(ei,si,set){
  return`<div class="series-row" id="srow-${ei}-${si}">
    <div class="series-num">${si+1}</div>
    <input class="input-sm input" type="number" step="0.5" value="${set.weight||''}" placeholder="kg"
      oninput="updateSet(${ei},${si},'weight',+this.value)" style="text-align:center;font-weight:500">
    <input class="input-sm input" type="text" value="${set.reps||''}" placeholder="reps"
      oninput="updateSet(${ei},${si},'reps',this.value)" style="text-align:center">
    <input class="input-sm input" type="number" min="1" max="10" value="${set.rpe||7}" placeholder="RPE"
      oninput="updateSet(${ei},${si},'rpe',+this.value)" style="text-align:center">
    <button class="series-done-btn ${set.done?'checked':''}" id="sdone-${ei}-${si}"
      onclick="haptic('medium');toggleSetDone(${ei},${si})">
      ${set.done?'✓':''}
    </button>
  </div>`;
}

function toggleExCard(ei){
  if(!curSession)return;
  const prevNote=document.getElementById(`ex-note-${ei}`)?.value;
  if(prevNote!==undefined)curSession.exercises[ei].note=prevNote;
  curSession.exercises[ei].expanded=!curSession.exercises[ei].expanded;
  renderSession();
  // Scroll to card
  setTimeout(()=>{const c=document.getElementById(`ex-card-${ei}`);if(c)c.scrollIntoView({behavior:'smooth',block:'nearest'});},50);
}

function updateSet(ei,si,field,val){
  if(!curSession)return;
  curSession.exercises[ei].sets[si][field]=val;
}

function toggleSetDone(ei,si){
  if(!curSession)return;
  const set=curSession.exercises[ei].sets[si];
  set.done=!set.done;
  const btn=document.getElementById(`sdone-${ei}-${si}`);
  if(btn){btn.classList.toggle('checked',set.done);btn.textContent=set.done?'✓':'';}
  // auto-start rest
  if(set.done){
    const ex=EXERCISES[curSession.exercises[ei].id];
    if(ex)startRest(ex.rest);
    // Check if all sets done
    const allDone=curSession.exercises[ei].sets.every(s=>s.done);
    if(allDone){
      haptic('success');
      const card=document.getElementById(`ex-card-${ei}`);
      if(card){card.style.borderColor='rgba(29,158,117,0.4)';
        const badge=card.querySelector('.badge');if(badge){badge.className='badge badge-green';badge.textContent='✓';}
      }
    }
  }
}

function setPattern(ei,pattern){
  if(!curSession)return;
  const prevNote=document.getElementById(`ex-note-${ei}`)?.value;
  if(prevNote!==undefined)curSession.exercises[ei].note=prevNote;
  curSession.exercises[ei].pattern=pattern;
  curSession.exercises[ei].sets=AI.predictSets(curSession.exercises[ei].id,pattern);
  renderSession();
  setTimeout(()=>{const c=document.getElementById(`ex-card-${ei}`);if(c)c.scrollIntoView({behavior:'smooth',block:'nearest'});},50);
}

function addSet(ei){
  if(!curSession)return;
  const prevNote=document.getElementById(`ex-note-${ei}`)?.value;
  if(prevNote!==undefined)curSession.exercises[ei].note=prevNote;
  const lastSet=curSession.exercises[ei].sets.slice(-1)[0]||{weight:0,reps:'8',rpe:7};
  curSession.exercises[ei].sets.push({...lastSet,done:false});
  // Re-render only the series grid
  const grid=document.getElementById(`series-grid-${ei}`);
  if(grid)grid.innerHTML=curSession.exercises[ei].sets.map((s,si)=>buildSeriesRow(ei,si,s)).join('');
}

function removeSet(ei){
  if(!curSession||curSession.exercises[ei].sets.length<=1)return;
  curSession.exercises[ei].sets.pop();
  const grid=document.getElementById(`series-grid-${ei}`);
  if(grid)grid.innerHTML=curSession.exercises[ei].sets.map((s,si)=>buildSeriesRow(ei,si,s)).join('');
}

// ===== REST TIMER =====
function startRest(secs){
  stopRest();
  restTimerObj.total=secs;restTimerObj.remaining=secs;
  const bar=document.getElementById('rest-bar');
  const cd=document.getElementById('rest-cd');
  const fill=document.getElementById('rest-fill');
  if(bar)bar.classList.add('visible');
  restTimerObj.interval=setInterval(()=>{
    restTimerObj.remaining--;
    const pct=Math.round(restTimerObj.remaining/restTimerObj.total*100);
    if(cd)cd.textContent=fmtTime(restTimerObj.remaining);
    if(fill)fill.style.width=pct+'%';
    if(restTimerObj.remaining<=0){
      stopRest();haptic('success');
      toast('Repos terminé — Go ! 💪','success');
      if(bar)setTimeout(()=>bar.classList.remove('visible'),2000);
    }
  },1000);
  if(cd)cd.textContent=fmtTime(secs);
}

function stopRest(){
  clearInterval(restTimerObj.interval);restTimerObj.interval=null;
  const bar=document.getElementById('rest-bar');
  if(bar)bar.classList.remove('visible');
}

// ===== SESSION TIMER =====
function startSessionTimer(){
  clearInterval(sessionTimer);
  sessionTimer=setInterval(()=>{
    const el=document.getElementById('sess-elapsed');
    if(!el){clearInterval(sessionTimer);return;}
    const e=Math.floor((Date.now()-(curSession?.startTime||Date.now()))/1000);
    el.textContent=fmtTime(e);
  },1000);
}
function stopSessionTimer(){clearInterval(sessionTimer);sessionTimer=null;}

// ===== CHRONO SHEET =====
function showChronoSheet(){
  const sheet=document.getElementById('chrono-sheet');
  document.getElementById('chrono-content').innerHTML=`
    <div class="sheet-handle"></div>
    <div class="chrono-display" id="chrono-disp">${fmtTime(chronoObj.elapsed)}</div>
    <div class="chrono-sub">${chronoObj.running?'En cours...':'Arrêté'}</div>
    <div style="display:flex;gap:8px;justify-content:center;margin-top:16px">
      <button class="btn btn-primary" style="min-width:100px" id="chrono-start-btn" onclick="toggleChrono()">
        ${chronoObj.running?'Pause':'Démarrer'}
      </button>
      <button class="btn btn-outline" onclick="resetChrono()">Reset</button>
    </div>
    <div style="display:flex;gap:8px;justify-content:center;margin-top:8px">
      <button class="btn btn-outline btn-sm" onclick="closeSheet('chrono-sheet')">Fermer</button>
    </div>`;
  sheet.classList.add('open');
}

function toggleChrono(){
  if(chronoObj.running){
    clearInterval(chronoObj.interval);chronoObj.running=false;
  } else {
    const start=Date.now()-chronoObj.elapsed*1000;
    chronoObj.interval=setInterval(()=>{
      chronoObj.elapsed=Math.floor((Date.now()-start)/1000);
      const d=document.getElementById('chrono-disp');if(d)d.textContent=fmtTime(chronoObj.elapsed);
    },1000);
    chronoObj.running=true;
  }
  const btn=document.getElementById('chrono-start-btn');
  if(btn)btn.textContent=chronoObj.running?'Pause':'Démarrer';
}

function resetChrono(){clearInterval(chronoObj.interval);chronoObj={interval:null,elapsed:0,running:false};const d=document.getElementById('chrono-disp');if(d)d.textContent='00:00';}

// ===== FINISH SESSION =====
function finishSession(){
  if(!curSession)return;
  stopSessionTimer();stopRest();
  const rpe=parseInt(document.getElementById('sess-rpe')?.value||7);
  const globalNote=document.getElementById('sess-global-note')?.value||'';
  // Collect notes from open cards
  curSession.exercises.forEach((ex,ei)=>{
    const noteEl=document.getElementById(`ex-note-${ei}`);
    if(noteEl)ex.note=noteEl.value;
  });
  const data={
    dayIndex:curSession.dayIdx,
    dayLabel:WEEKLY_PROGRAM[curSession.dayIdx].label,
    duration:Math.floor((Date.now()-curSession.startTime)/60000),
    sessionRpe:rpe,
    note:globalNote,
    completed:true,
    exercises:curSession.exercises.map(ex=>({
      id:ex.id,
      pattern:ex.pattern,
      sets:ex.sets.map(s=>({weight:s.weight||0,reps:s.reps||'',rpe:s.rpe||7,done:s.done||false})),
      note:ex.note||''
    }))
  };
  Storage.logSession(data);
  curSession=null;
  haptic('success');
  toast('Séance enregistrée 🎉','success');
  setTimeout(()=>nav('home'),500);
}

// ===== EXERCISE DETAIL SHEET =====
function showExDetail(exId){
  sheetExId=exId;sheetMediaMode='anim';
  const ex=EXERCISES[exId];if(!ex)return;
  const hist=Storage.getExHistory(exId);
  const notes=Storage.getExNotes(exId);
  const pred=AI.predictSets(exId);
  const predMax=pred.length?Math.max(...pred.map(s=>s.weight||0)):0;
  const future=AI.projectFuture(exId,5);
  const hasAnim=!!ExerciseAnimations?.[exId];

  const content=document.getElementById('ex-sheet-content');
  content.innerHTML=`
    <div class="sheet-handle"></div>
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:4px">
      <div class="sheet-title" style="flex:1;padding-right:10px;font-size:22px">${ex.name}</div>
      <button class="btn btn-ghost btn-icon-sm" onclick="closeSheet('ex-sheet')" style="color:var(--text2);font-size:16px">✕</button>
    </div>
    <div class="sheet-sub">${ex.sets}×${ex.reps} · ${ex.rest}s repos · ${ex.tempo}</div>

    ${(hasAnim&&ex.videoUrl)?`<div class="media-tabs">
      <button id="btn-anim" class="btn btn-primary btn-sm" onclick="switchMedia('${exId}','anim')">Animation</button>
      <button id="btn-vid" class="btn btn-outline btn-sm" onclick="switchMedia('${exId}','video')">Vidéo YouTube</button>
    </div>`:''}
    <div class="media-container" id="media-container"></div>

    <div style="margin-bottom:10px">
      <div class="section-label">Muscles</div>
      <div class="muscle-list">${ex.muscles.map(m=>`<span class="muscle-tag ${m===ex.primaryMuscle?'muscle-primary':''}">${m}${m===ex.primaryMuscle?' ★':''}</span>`).join('')}</div>
    </div>

    <div class="feel-box" style="margin-bottom:10px">
      <div class="feel-label">Où sentir l'effort</div>
      <p>${ex.feel}</p>
    </div>

    <div style="margin-bottom:10px">
      <div class="section-label">Points techniques (${ex.cues.length})</div>
      <ul class="cue-list">${ex.cues.map(c=>`<li>${c}</li>`).join('')}</ul>
    </div>

    <div class="pred-card" style="margin-bottom:10px">
      <div style="font-size:10px;color:var(--text2);margin-bottom:3px">🤖 Prédiction IA — prochaine séance</div>
      <div class="pred-weight">${predMax>0?predMax+' kg':'Poids du corps'}</div>
      <div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:8px">
        ${future.map((f,i)=>`<span style="background:rgba(29,158,117,${.08+i*.1});color:var(--accent);padding:3px 9px;border-radius:99px;font-size:11px;border:.5px solid rgba(29,158,117,.25)">S${i+1}: ${f.weight>0?f.weight+'kg':'BW'}</span>`).join('')}
      </div>
    </div>

    <!-- AI INSIGHT -->
    <div class="ai-insight" id="ex-ai-insight" style="margin-bottom:10px">
      <div class="ai-insight-header"><div class="ai-pulse"></div><span class="ai-title">🤖 Analyse IA de tes notes</span></div>
      <div id="ex-ai-text" class="ai-text" style="font-size:12px;color:var(--text3)">Chargement...</div>
    </div>

    <!-- NOTES -->
    <div style="margin-bottom:10px">
      <div class="section-label">Notes liées à cet exercice (${notes.length})</div>
      ${notes.length?notes.slice(0,5).map(n=>`<div class="note-item">
        <div class="note-date">${fmtDate(n.date)}</div>
        <div class="note-text">${n.text}</div>
      </div>`).join(''):`<div style="font-size:12px;color:var(--text3)">Aucune note. Ajoutes-en pendant tes séances.</div>`}
    </div>

    <!-- HISTORY -->
    ${hist.length?`<div style="margin-bottom:10px">
      <div class="section-label">Historique (${hist.length} séances)</div>
      ${hist.slice(-5).reverse().map(h=>{
        const maxW=Math.max(...(h.sets||[]).map(s=>s.weight||0),0);
        const vol=(h.sets||[]).reduce((a,s)=>a+(s.weight||0)*(parseInt(s.reps)||0),0);
        return`<div style="padding:7px 0;border-bottom:.5px solid var(--border)">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span style="font-size:12px;color:var(--text3)">${fmtDate(h.date)}</span>
            <div style="display:flex;gap:10px;align-items:center">
              <span style="font-size:13px;font-weight:500">${maxW>0?maxW+'kg':'BW'}</span>
              <span style="font-size:10px;padding:2px 6px;background:var(--surface2);border-radius:4px;color:var(--text3)">${h.pattern||'flat'}</span>
              <span style="font-size:10px;color:var(--text3)">Vol: ${Math.round(vol)}kg</span>
              <span style="font-size:11px;color:${(h.sets||[]).every(s=>s.done)?'var(--accent)':'var(--text3)'}">
                ${(h.sets||[]).filter(s=>s.done).length}/${(h.sets||[]).length}✓
              </span>
            </div>
          </div>
          <div style="display:flex;gap:5px;margin-top:4px;flex-wrap:wrap">
            ${(h.sets||[]).map((s,i)=>`<span style="font-size:10px;padding:2px 7px;background:${s.done?'var(--accent-dim)':'var(--surface2)'};color:${s.done?'var(--accent)':'var(--text3)'};border-radius:99px">${i+1}: ${s.weight||'BW'}kg×${s.reps||'?'}</span>`).join('')}
          </div>
        </div>`;
      }).join('')}
    </div>`:''}

    <button class="btn btn-outline btn-full btn-sm" onclick="closeSheet('ex-sheet')">Fermer</button>
  `;

  document.getElementById('ex-sheet').classList.add('open');
  setTimeout(()=>renderMedia(exId),60);
  AI.analyzeExerciseNotes(exId).then(text=>{
    const el=document.getElementById('ex-ai-text');
    if(el)el.textContent=text||'Ajoute des notes pendant tes séances pour obtenir une analyse personnalisée.';
  });
}

function renderMedia(exId){
  const c=document.getElementById('media-container');if(!c)return;
  const ex=EXERCISES[exId];
  if(sheetMediaMode==='anim'&&ExerciseAnimations?.[exId]){
    AnimController?.start(exId,c);
  } else if(ex?.videoUrl){
    AnimController?.stopAll();
    c.innerHTML=`<div class="video-placeholder" onclick="loadVideo('${exId}','${ex.videoUrl}')">
      <div class="play-btn"><svg viewBox="0 0 24 24" fill="white" width="22" height="22"><path d="M8 5v14l11-7z"/></svg></div>
      <div style="font-size:12px;color:var(--text2)">Charger la démonstration</div>
      <div style="font-size:10px;color:var(--text3)">Nécessite internet</div>
    </div>`;
  }
}

function switchMedia(exId,mode){
  sheetMediaMode=mode;
  document.getElementById('btn-anim')?.classList.toggle('btn-primary',mode==='anim');
  document.getElementById('btn-anim')?.classList.toggle('btn-outline',mode!=='anim');
  document.getElementById('btn-vid')?.classList.toggle('btn-primary',mode==='video');
  document.getElementById('btn-vid')?.classList.toggle('btn-outline',mode!=='video');
  AnimController?.stopAll();renderMedia(exId);
}

function loadVideo(exId,url){
  const c=document.getElementById('media-container');if(!c)return;
  c.innerHTML=`<div style="position:relative;padding-bottom:56.25%"><iframe style="position:absolute;inset:0;width:100%;height:100%;border:none" src="${url}?autoplay=1&rel=0" allowfullscreen allow="autoplay"></iframe></div>`;
}

function closeSheet(id){
  AnimController?.stopAll();
  document.getElementById(id)?.classList.remove('open');
}

// ===== STATS PAGE =====
function renderStats(){
  const s=Storage.get();
  const weights=s.weightLog||[];
  const sessions=s.sessionLogs||[];
  const analysis=AI.weekAnalysis(sessions.slice(0,6));
  const bodyProj=AI.projectBodyWeight(s.profile.weight,s.profile.targetWeight);

  document.getElementById('page-stats').innerHTML=`
  <div class="page-header"><div class="page-title">STATS & IA</div><div class="page-sub">Progression · Prédictions · Volume</div></div>
  <div class="px">

  <div class="card fade-up">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
      <span style="font-size:13px;font-weight:500">Poids corporel</span>
      <div style="display:flex;gap:6px">
        <input type="number" step="0.1" class="input input-sm" style="width:72px" placeholder="${s.profile.weight}" id="w-input">
        <button class="btn btn-primary btn-sm" onclick="haptic('medium');saveWeight()">+</button>
      </div>
    </div>
    <div class="chart-wrap chart-180"><canvas id="chart-weight"></canvas></div>
    <div style="font-size:11px;color:var(--accent);margin-top:6px;padding:6px 10px;background:var(--accent-dim);border-radius:6px">
      🤖 Objectif ${s.profile.targetWeight}kg atteint dans ~${bodyProj.weeksNeeded} semaines (+${bodyProj.kgPerWeek}kg/sem)
    </div>
  </div>

  <div class="card fade-up" style="animation-delay:.04s">
    <div style="font-size:13px;font-weight:500;margin-bottom:8px">Charge hebdomadaire</div>
    <div class="stats-row stats-2" style="margin-bottom:8px">
      <div class="stat-box"><div class="stat-val">${analysis.avgRpe}</div><div class="stat-lbl">RPE moyen</div></div>
      <div class="stat-box"><div class="stat-val">${sessions.filter(x=>new Date(x.date)>new Date(Date.now()-7*864e5)).length}</div><div class="stat-lbl">séances 7j</div></div>
    </div>
    <div class="ai-insight" style="margin:0"><div class="ai-text" style="font-size:12px">${analysis.recommendation}</div></div>
  </div>

  <div class="section-label" style="margin-top:4px">Volume par exercice</div>
  ${WEEKLY_PROGRAM.filter(d=>d.type==='gym').flatMap(day=>day.exercises.slice(0,2)).map(exId=>{
    const ex=EXERCISES[exId];if(!ex)return'';
    const hist=Storage.getExHistory(exId);
    const lastW=Storage.getLastWeight(exId);
    const pred=AI.predictSets(exId);
    const predMax=pred.length?Math.max(...pred.map(s=>s.weight||0)):0;
    return`<div class="card-sm card-interactive fade-up" style="margin-bottom:7px" onclick="haptic();showExDetail('${exId}')">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span style="font-size:13px;font-weight:500">${ex.name}</span>
        <span style="font-size:11px;color:var(--accent)">→</span>
      </div>
      <div style="display:flex;gap:14px;margin-top:5px;align-items:flex-end">
        <div><div style="font-size:9px;color:var(--text3)">Dernier</div><div style="font-size:16px;font-weight:600">${lastW?lastW+'kg':'—'}</div></div>
        <div><div style="font-size:9px;color:var(--text3)">IA prédit</div><div style="font-size:16px;font-weight:600;color:var(--accent)">${predMax?predMax+'kg':'BW'}</div></div>
        <div style="flex:1"><div class="prog-bg" style="margin-bottom:2px"><div class="prog-fill" style="width:${Math.min(100,hist.length*12)}%"></div></div>
        <div style="font-size:9px;color:var(--text3)">${hist.length} séances</div></div>
      </div>
    </div>`;
  }).join('')}

  <div class="section-label" style="margin-top:6px">Dernières séances</div>
  ${sessions.slice(0,8).map(s=>`<div class="card-sm fade-up" style="margin-bottom:7px">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <span style="font-size:13px;font-weight:500">${s.dayLabel}</span>
      <span style="font-size:11px;color:var(--text3)">${fmtDate(s.date)}</span>
    </div>
    <div style="display:flex;gap:10px;margin-top:4px;flex-wrap:wrap">
      <span style="font-size:11px;color:var(--text2)">${s.duration||'?'}min</span>
      <span style="font-size:11px;color:${(s.sessionRpe||7)>8?'var(--red)':(s.sessionRpe||7)<6?'var(--accent)':'var(--text2)'}">RPE ${s.sessionRpe}</span>
      <span style="font-size:11px;color:var(--accent)">${(s.exercises||[]).filter(e=>(e.sets||[]).every(x=>x.done)).length}/${(s.exercises||[]).length} ex. ✓</span>
      ${s.note?`<span style="font-size:11px;color:var(--text3)">📝 Note</span>`:''}
    </div>
    ${s.note?`<div style="font-size:11px;color:var(--text3);margin-top:4px;font-style:italic">"${s.note.slice(0,80)}${s.note.length>80?'...':''}"</div>`:''}
  </div>`).join('')}
  </div>`;

  setTimeout(()=>{
    const ctx=document.getElementById('chart-weight');
    if(!ctx||typeof Chart==='undefined')return;
    if(charts.weight)charts.weight.destroy();
    const labels=weights.map(w=>fmtDate(w.date));
    const data=weights.map(w=>w.weight);
    const proj=bodyProj.points.slice(1,5);
    charts.weight=new Chart(ctx,{type:'line',data:{
      labels:[...labels,...proj.map((_,i)=>`+${i+1}sem`)],
      datasets:[
        {label:'Poids',data:[...data,...Array(proj.length).fill(null)],borderColor:'#1D9E75',backgroundColor:'rgba(29,158,117,0.07)',pointRadius:3,tension:.3,fill:true},
        {label:'Projection IA',data:[...Array(data.length).fill(null),data[data.length-1],...proj.map(p=>p.weight)],borderColor:'#378ADD',borderDash:[5,4],pointRadius:2,tension:.3,fill:false},
        {label:'Objectif',data:Array(labels.length+proj.length).fill(s.profile.targetWeight),borderColor:'#e8a020',borderDash:[3,3],pointRadius:0,borderWidth:1.5}
      ]},options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{labels:{color:'#5a5a62',font:{size:9},boxWidth:16}}},
      scales:{y:{min:63,max:72,ticks:{color:'#5a5a62',font:{size:9},callback:v=>v+'kg'},grid:{color:'rgba(255,255,255,0.03)'}},
      x:{ticks:{color:'#5a5a62',font:{size:9},maxTicksLimit:5},grid:{display:false}}}}});
  },100);
}

function saveWeight(){
  const v=parseFloat(document.getElementById('w-input')?.value);
  if(!v||v<40||v>200){toast('Poids invalide','error');return;}
  Storage.logWeight(v);toast(`${v}kg enregistré ✓`,'success');renderStats();
}

// ===== NUTRITION PAGE =====
function renderNutrition(){
  const todayNut=Storage.getTodayNutrition()||{date:new Date().toISOString(),meals:[
    {name:'Petit-déjeuner',emoji:'🌅',items:[]},
    {name:'Déjeuner',emoji:'☀️',items:[]},
    {name:'Collation',emoji:'🍌',items:[]},
    {name:'Dîner',emoji:'🌙',items:[]},
    {name:'Après séance',emoji:'💪',items:[]}
  ]};
  nutritionState=JSON.parse(JSON.stringify(todayNut));
  const goals=Storage.getNutritionGoals();

  // Compute totals
  const totals=computeNutTotals(nutritionState.meals);

  document.getElementById('page-nutrition').innerHTML=`
  <div class="page-header"><div class="page-title">NUTRITION</div>
  <div class="page-sub">${new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'})}</div></div>
  <div class="px">

  <!-- Macro summary -->
  <div class="card fade-up">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
      <span style="font-size:13px;font-weight:500">Macros du jour</span>
      <span style="font-size:11px;color:var(--accent);font-weight:600">${Math.round(totals.kcal)} / ${goals.kcal} kcal</span>
    </div>
    <div class="prog-bg" style="margin-bottom:10px"><div class="prog-fill" style="width:${Math.min(100,Math.round(totals.kcal/goals.kcal*100))}%"></div></div>
    <div class="stats-row stats-3">
      <div class="stat-box" style="text-align:center">
        <div style="font-size:16px;font-weight:600;color:#378ADD">${Math.round(totals.protein)}g</div>
        <div class="stat-lbl">Protéines/${goals.protein}g</div>
        <div class="prog-bg" style="margin-top:3px"><div class="prog-fill prog-fill-blue" style="width:${Math.min(100,Math.round(totals.protein/goals.protein*100))}%"></div></div>
      </div>
      <div class="stat-box" style="text-align:center">
        <div style="font-size:16px;font-weight:600;color:var(--gold)">${Math.round(totals.carbs)}g</div>
        <div class="stat-lbl">Glucides/${goals.carbs}g</div>
        <div class="prog-bg" style="margin-top:3px"><div class="prog-fill prog-fill-gold" style="width:${Math.min(100,Math.round(totals.carbs/goals.carbs*100))}%"></div></div>
      </div>
      <div class="stat-box" style="text-align:center">
        <div style="font-size:16px;font-weight:600;color:var(--red)">${Math.round(totals.fat)}g</div>
        <div class="stat-lbl">Lipides/${goals.fat}g</div>
        <div class="prog-bg" style="margin-top:3px"><div class="prog-fill" style="width:${Math.min(100,Math.round(totals.fat/goals.fat*100))}%;background:var(--red)"></div></div>
      </div>
    </div>
  </div>

  <!-- Scanner -->
  <button class="btn btn-outline btn-full fade-up" style="margin-bottom:10px;animation-delay:.04s" onclick="openScanner()">
    📸 Scanner un code-barres (Open Food Facts)
  </button>

  <!-- Meals -->
  <div id="meals-container"></div>

  <!-- Add free note -->
  <div class="card fade-up" style="animation-delay:.1s">
    <div class="input-label" style="margin-bottom:6px">Note libre nutrition</div>
    <textarea class="input input-sm" rows="2" id="nut-note" placeholder="Ex: J'ai bien mangé mes protéines, manque de légumes..." style="resize:none;margin-bottom:8px"></textarea>
    <button class="btn btn-outline btn-full btn-sm" onclick="saveNutritionNote()">Enregistrer la note</button>
  </div>

  </div>`;

  renderMeals();
}

function computeNutTotals(meals){
  let kcal=0,protein=0,carbs=0,fat=0;
  for(const meal of meals){for(const item of meal.items){
    const q=(item.qty||100)/100;
    kcal+=(item.kcal||0)*q;protein+=(item.p||0)*q;carbs+=(item.c||0)*q;fat+=(item.f||0)*q;
  }}
  return{kcal,protein,carbs,fat};
}

function renderMeals(){
  const c=document.getElementById('meals-container');if(!c)return;
  c.innerHTML=nutritionState.meals.map((meal,mi)=>`
  <div class="card fade-up" style="animation-delay:${.05+mi*.03}s">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
      <div style="display:flex;align-items:center;gap:8px">
        <span style="font-size:20px">${meal.emoji}</span>
        <span style="font-size:14px;font-weight:500">${meal.name}</span>
        <span style="font-size:11px;color:var(--text3)">${Math.round(meal.items.reduce((a,i)=>a+(i.kcal||0)*(i.qty||100)/100,0))} kcal</span>
      </div>
      <button class="btn btn-xs btn-outline" onclick="showAddFoodSheet(${mi})">+ Aliment</button>
    </div>
    ${meal.items.length?meal.items.map((item,ii)=>`
    <div class="food-log-item">
      <div class="food-icon">${item.emoji||'🍽️'}</div>
      <div style="flex:1">
        <div class="food-name">${item.name}</div>
        <div class="food-sub">${item.qty||100}${item.unit||'g'} · P:${Math.round((item.p||0)*(item.qty||100)/100)}g G:${Math.round((item.c||0)*(item.qty||100)/100)}g L:${Math.round((item.f||0)*(item.qty||100)/100)}g</div>
      </div>
      <div style="text-align:right">
        <div class="food-kcal">${Math.round((item.kcal||0)*(item.qty||100)/100)}</div>
        <div style="font-size:9px;color:var(--text3)">kcal</div>
      </div>
      <button class="btn btn-ghost btn-xs" onclick="removeFoodItem(${mi},${ii})" style="color:var(--red);margin-left:4px">✕</button>
    </div>`).join(''):`<div style="font-size:12px;color:var(--text3);padding:6px 0">Aucun aliment · Appuie sur + pour ajouter</div>`}
  </div>`).join('');
}

let scannerMealIdx=0;
function showAddFoodSheet(mi){
  scannerMealIdx=mi;
  const content=document.getElementById('food-sheet-content');
  content.innerHTML=`
    <div class="sheet-handle"></div>
    <div class="sheet-title">Ajouter un aliment</div>
    <div class="sheet-sub">${nutritionState.meals[mi].name}</div>

    <!-- Search -->
    <div style="margin-bottom:10px">
      <div class="input-label">Recherche (Open Food Facts)</div>
      <div style="display:flex;gap:8px">
        <input class="input" id="food-search" placeholder="Ex: riz basmati, yaourt grec..." oninput="searchFoodDebounce()">
        <button class="btn btn-outline btn-sm" onclick="openScanner()">📸</button>
      </div>
      <div id="food-results" style="margin-top:8px"></div>
    </div>

    <div class="divider"></div>

    <!-- Manual entry -->
    <div style="margin-top:10px">
      <div style="font-size:12px;font-weight:500;margin-bottom:8px">Saisie manuelle</div>
      <input class="input input-sm" id="food-name-manual" placeholder="Nom de l'aliment" style="margin-bottom:6px">
      <div class="input-grid-3" style="margin-bottom:6px">
        <div><div class="input-label">kcal/100g</div><input class="input input-sm" id="food-kcal" type="number" placeholder="100"></div>
        <div><div class="input-label">Protéines g</div><input class="input input-sm" id="food-prot" type="number" placeholder="10"></div>
        <div><div class="input-label">Glucides g</div><input class="input input-sm" id="food-carb" type="number" placeholder="20"></div>
      </div>
      <div class="input-grid-2" style="margin-bottom:8px">
        <div><div class="input-label">Lipides g</div><input class="input input-sm" id="food-fat" type="number" placeholder="5"></div>
        <div><div class="input-label">Quantité (g/ml)</div><input class="input input-sm" id="food-qty" type="number" placeholder="100"></div>
      </div>
      <button class="btn btn-primary btn-full btn-sm" onclick="addFoodManual(${mi})">Ajouter</button>
    </div>

    <!-- Quick foods -->
    <div style="margin-top:12px">
      <div class="input-label" style="margin-bottom:6px">Aliments recommandés (programme)</div>
      <div id="quick-foods"></div>
    </div>

    <button class="btn btn-outline btn-full btn-sm" style="margin-top:10px" onclick="closeSheet('food-sheet')">Fermer</button>
  `;
  document.getElementById('food-sheet').classList.add('open');
  renderQuickFoods(mi);
}

const QUICK_FOODS=[
  {name:'Œuf entier',emoji:'🥚',kcal:155,p:13,c:1.1,f:11,unit:'unité',qty:60},
  {name:'Saumon cuit',emoji:'🐟',kcal:182,p:25,c:0,f:8.1,unit:'g',qty:120},
  {name:'Poulet (blanc)',emoji:'🍗',kcal:165,p:31,c:0,f:3.6,unit:'g',qty:150},
  {name:'Riz cuit',emoji:'🍚',kcal:130,p:2.7,c:28,f:0.3,unit:'g',qty:200},
  {name:'Patate douce',emoji:'🍠',kcal:86,p:1.6,c:20,f:0.1,unit:'g',qty:150},
  {name:'Skyr nature',emoji:'🥛',kcal:63,p:11,c:4,f:0.2,unit:'g',qty:170},
  {name:'Yaourt grec 0%',emoji:'🫙',kcal:59,p:10,c:3.6,f:0.4,unit:'g',qty:170},
  {name:'Banane',emoji:'🍌',kcal:89,p:1.1,c:23,f:0.3,unit:'g',qty:120},
  {name:'Flocons d\'avoine',emoji:'🌾',kcal:389,p:17,c:66,f:7,unit:'g',qty:80},
  {name:'Pain complet',emoji:'🍞',kcal:247,p:8.5,c:41,f:3.5,unit:'g',qty:60},
  {name:'Amandes',emoji:'🌰',kcal:579,p:21,c:22,f:50,unit:'g',qty:30},
  {name:'Avocat',emoji:'🥑',kcal:160,p:2,c:9,f:15,unit:'g',qty:100},
];

function renderQuickFoods(mi){
  const c=document.getElementById('quick-foods');if(!c)return;
  c.innerHTML=QUICK_FOODS.map(f=>`<div class="food-log-item card-interactive" style="cursor:pointer" onclick="addQuickFood(${mi},${JSON.stringify(f).replace(/"/g,"'")})">
    <div class="food-icon">${f.emoji}</div>
    <div style="flex:1"><div class="food-name">${f.name}</div>
    <div class="food-sub">${f.qty}${f.unit} · ${Math.round(f.kcal*f.qty/100)}kcal · P:${Math.round(f.p*f.qty/100)}g</div></div>
    <button class="btn btn-xs btn-outline">+</button>
  </div>`).join('');
}

function addQuickFood(mi,fStr){
  const f=typeof fStr==='string'?JSON.parse(fStr.replace(/'/g,'"')):fStr;
  nutritionState.meals[mi].items.push({...f});
  Storage.saveTodayNutrition(nutritionState);
  closeSheet('food-sheet');
  renderNutrition();
  toast(`${f.name} ajouté ✓`,'success');
}

let foodSearchTimer=null;
function searchFoodDebounce(){
  clearTimeout(foodSearchTimer);
  foodSearchTimer=setTimeout(()=>searchFood(),500);
}

async function searchFood(){
  const q=document.getElementById('food-search')?.value?.trim();
  if(!q||q.length<3)return;
  const res=document.getElementById('food-results');
  if(res)res.innerHTML=`<div style="font-size:12px;color:var(--text3)">Recherche...</div>`;
  try{
    const r=await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=5&fields=product_name,nutriments,image_small_url,brands`);
    const data=await r.json();
    const products=(data.products||[]).filter(p=>p.product_name&&p.nutriments?.['energy-kcal_100g']);
    if(!products.length){if(res)res.innerHTML=`<div style="font-size:12px;color:var(--text3)">Aucun résultat</div>`;return;}
    if(res)res.innerHTML=products.map(p=>{
      const kcal=Math.round(p.nutriments['energy-kcal_100g']||0);
      const prot=+(p.nutriments['proteins_100g']||0).toFixed(1);
      const carb=+(p.nutriments['carbohydrates_100g']||0).toFixed(1);
      const fat=+(p.nutriments['fat_100g']||0).toFixed(1);
      const name=(p.product_name||'').slice(0,40);
      return`<div class="food-log-item card-interactive" style="cursor:pointer" onclick="addSearchedFood(${scannerMealIdx},'${name.replace(/'/g,"\\'")}',${kcal},${prot},${carb},${fat})">
        <div class="food-icon">🔍</div>
        <div style="flex:1"><div class="food-name">${name}</div>
        <div class="food-sub">P:${prot}g G:${carb}g L:${fat}g / 100g</div></div>
        <div style="text-align:right"><div class="food-kcal">${kcal}</div><div style="font-size:9px;color:var(--text3)">kcal/100g</div></div>
      </div>`;
    }).join('');
  }catch(e){if(res)res.innerHTML=`<div style="font-size:12px;color:var(--red)">Erreur réseau</div>`;}
}

function addSearchedFood(mi,name,kcal,p,c,f){
  nutritionState.meals[mi].items.push({name,emoji:'🔍',kcal,p,c,f,qty:100,unit:'g'});
  Storage.saveTodayNutrition(nutritionState);
  closeSheet('food-sheet');renderNutrition();
  toast(`${name.slice(0,20)} ajouté ✓`,'success');
}

function addFoodManual(mi){
  const name=document.getElementById('food-name-manual')?.value?.trim();
  const kcal=parseFloat(document.getElementById('food-kcal')?.value)||0;
  const p=parseFloat(document.getElementById('food-prot')?.value)||0;
  const c=parseFloat(document.getElementById('food-carb')?.value)||0;
  const f=parseFloat(document.getElementById('food-fat')?.value)||0;
  const qty=parseFloat(document.getElementById('food-qty')?.value)||100;
  if(!name){toast('Nom requis','error');return;}
  nutritionState.meals[mi].items.push({name,emoji:'🍽️',kcal,p,c,f,qty,unit:'g'});
  Storage.saveTodayNutrition(nutritionState);
  closeSheet('food-sheet');renderNutrition();
  toast(`${name} ajouté ✓`,'success');
}

function removeFoodItem(mi,ii){
  nutritionState.meals[mi].items.splice(ii,1);
  Storage.saveTodayNutrition(nutritionState);renderNutrition();
}

function saveNutritionNote(){
  const note=document.getElementById('nut-note')?.value?.trim();
  if(!note)return;
  Storage.addGlobalMemo(`[Nutrition] ${note}`);
  toast('Note enregistrée ✓','success');
  document.getElementById('nut-note').value='';
}

function openScanner(){
  // Open file input to capture barcode via camera
  let inp=document.getElementById('barcode-input');
  if(!inp){inp=document.createElement('input');inp.type='file';inp.accept='image/*';inp.capture='environment';inp.id='barcode-input';inp.style.display='none';
    inp.onchange=async(e)=>{
      const file=e.target.files[0];if(!file)return;
      toast('Scan en cours...','info',3000);
      // Use Open Food Facts barcode image lookup — simplified: just open search
      toast('Utilise la recherche texte pour l\'instant','info',3000);
    };
    document.body.appendChild(inp);}
  inp.click();
}

// ===== POSTURE PAGE =====
function renderPosture(){
  document.getElementById('page-posture').innerHTML=`
  <div class="page-header"><div class="page-title">POSTURE</div><div class="page-sub">Routine quotidienne · 10–12 min</div></div>
  <div class="px">
  <div class="card card-accent fade-up">
    <div style="font-size:12px;font-weight:600;color:var(--accent)">Syndrome croisé supérieur</div>
    <div style="font-size:12px;color:rgba(29,158,117,.85);margin-top:4px;line-height:1.5">7 exercices qui corrigent la tête en avant et les épaules enroulées. À faire chaque matin.</div>
  </div>
  ${POSTURE_ROUTINE.map((ex,i)=>`
  <div class="card fade-up" style="animation-delay:${i*.04}s">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
      <div><div style="font-size:14px;font-weight:500">${ex.name}</div>
      <div style="font-size:11px;color:var(--accent);margin-top:2px">${ex.duration}</div></div>
      <span style="background:var(--surface2);color:var(--text3);padding:3px 8px;border-radius:99px;font-size:10px">${i+1}/${POSTURE_ROUTINE.length}</span>
    </div>
    <div class="muscle-list">${ex.muscles.map(m=>`<span class="muscle-tag">${m}</span>`).join('')}</div>
    <div class="feel-box" style="margin:7px 0">
      <div class="feel-label">Où sentir</div>
      <p style="font-size:12px">${ex.feel}</p>
    </div>
    <div style="font-size:12px;color:var(--text2);line-height:1.6">${ex.instruction}</div>
  </div>`).join('')}
  <div class="card fade-up">
    <div style="font-size:13px;font-weight:500;margin-bottom:6px">📱 La règle principale</div>
    <div style="font-size:12px;color:var(--text2);line-height:1.7">
      Téléphone à hauteur des yeux.<br>
      <b style="color:var(--text)">1h tête baissée = 27kg de pression sur la nuque.</b><br>
      Sans ça, les exercices ne suffiront pas.
    </div>
  </div></div>`;
}

// ===== PROFILE PAGE =====
function renderProfile(){
  const s=Storage.get();
  const notif=typeof Notification!=='undefined'&&Notification.permission==='granted';
  document.getElementById('page-profile').innerHTML=`
  <div class="page-header"><div class="page-title">PROFIL</div><div class="page-sub">Paramètres · Données · Deezer</div></div>
  <div class="px">

  <div class="card fade-up">
    <div style="font-size:13px;font-weight:500;margin-bottom:10px">Profil</div>
    <div class="input-grid-2" style="margin-bottom:8px">
      <div><div class="input-label">Poids (kg)</div><input class="input input-sm" type="number" step=".1" value="${s.profile.weight}" id="p-weight"></div>
      <div><div class="input-label">Objectif (kg)</div><input class="input input-sm" type="number" step=".1" value="${s.profile.targetWeight}" id="p-target"></div>
    </div>
    <button class="btn btn-primary btn-full btn-sm" onclick="haptic('medium');saveProfile()">Enregistrer</button>
  </div>

  <!-- Deezer -->
  <div class="card fade-up" style="animation-delay:.04s">
    <div style="font-size:13px;font-weight:500;margin-bottom:8px">🎵 Deezer</div>
    <div style="font-size:12px;color:var(--text2);margin-bottom:8px">Colle l'URL de ta playlist d'entraînement Deezer</div>
    <div class="input-label">Nom de la playlist</div>
    <input class="input input-sm" id="deezer-name" value="${s.profile.deezerPlaylistName||''}" placeholder="Ma playlist entraînement" style="margin-bottom:6px">
    <div class="input-label">URL Deezer</div>
    <input class="input input-sm" id="deezer-url" value="${s.profile.deezerPlaylistUrl||''}" placeholder="https://www.deezer.com/playlist/...">
    <button class="btn btn-gold btn-full btn-sm" style="margin-top:8px" onclick="saveDeezer()">Enregistrer Deezer</button>
    ${s.profile.deezerPlaylistUrl?`<div class="deezer-widget" style="margin-top:8px" onclick="openDeezer()">
      <div class="deezer-icon">🎵</div>
      <div class="deezer-info"><div class="deezer-title">${s.profile.deezerPlaylistName||'Ma playlist'}</div>
      <div class="deezer-sub">Appuie pour ouvrir dans Deezer</div></div>
      <div class="deezer-play"><svg viewBox="0 0 24 24" fill="black" width="18" height="18"><path d="M8 5v14l11-7z"/></svg></div>
    </div>`:''}
  </div>

  <!-- Objectifs nutrition -->
  <div class="card fade-up" style="animation-delay:.06s">
    <div style="font-size:13px;font-weight:500;margin-bottom:8px">🥗 Objectifs nutrition</div>
    <div class="input-grid-2" style="margin-bottom:6px">
      <div><div class="input-label">kcal/jour</div><input class="input input-sm" type="number" id="goal-kcal" value="${s.nutrition.goals.kcal}"></div>
      <div><div class="input-label">Protéines (g)</div><input class="input input-sm" type="number" id="goal-prot" value="${s.nutrition.goals.protein}"></div>
    </div>
    <div class="input-grid-2" style="margin-bottom:8px">
      <div><div class="input-label">Glucides (g)</div><input class="input input-sm" type="number" id="goal-carb" value="${s.nutrition.goals.carbs}"></div>
      <div><div class="input-label">Lipides (g)</div><input class="input input-sm" type="number" id="goal-fat" value="${s.nutrition.goals.fat}"></div>
    </div>
    <button class="btn btn-outline btn-full btn-sm" onclick="saveNutritionGoals()">Enregistrer les objectifs</button>
  </div>

  <!-- Notifications -->
  <div class="card fade-up" style="animation-delay:.08s">
    <div style="font-size:13px;font-weight:500;margin-bottom:6px">🔔 Notifications</div>
    <div style="font-size:12px;color:var(--text2);margin-bottom:8px">Rappels la veille de tes séances salle</div>
    <button class="btn btn-full ${notif?'btn-outline':'btn-primary'} btn-sm" onclick="setupNotif()">
      ${notif?'✓ Activées':'Activer les rappels'}
    </button>
  </div>

  <!-- Memos -->
  <div class="card fade-up" style="animation-delay:.1s">
    <div style="font-size:13px;font-weight:500;margin-bottom:8px">📝 Notes globales</div>
    <textarea class="input input-sm" rows="2" id="memo-inp" placeholder="Objectifs, ressentis, PR..." style="resize:none;margin-bottom:6px"></textarea>
    <button class="btn btn-outline btn-full btn-sm" onclick="addMemo()">Ajouter</button>
    <div id="memo-list" style="margin-top:8px"></div>
  </div>

  <!-- Data -->
  <div class="card fade-up" style="animation-delay:.12s">
    <div class="section-label" style="margin-bottom:8px">Données</div>
    <button class="btn btn-outline btn-full btn-sm" style="margin-bottom:6px" onclick="Storage.exportData();toast('Exporté ✓','success')">↓ Exporter (JSON)</button>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:6px">
      <button class="btn btn-outline btn-sm" onclick="triggerImport('merge')">↑ Fusionner</button>
      <button class="btn btn-outline btn-sm" onclick="triggerImport('replace')">↑ Remplacer</button>
    </div>
    <input type="file" id="imp-merge" accept=".json" style="display:none" onchange="doImport(this,'merge')">
    <input type="file" id="imp-replace" accept=".json" style="display:none" onchange="doImport(this,'replace')">
    <div style="font-size:10px;color:var(--text3);line-height:1.5">Fusionner = ajoute sans écraser · Remplacer = restauration complète</div>
  </div>

  <div class="card fade-up" style="animation-delay:.14s;border-color:rgba(224,82,82,.25)">
    <button class="btn btn-danger btn-full btn-sm" onclick="if(confirm('Effacer TOUT ?'))Storage.reset()">Réinitialiser les données</button>
  </div>

  <!-- Deploy guide -->
  <div class="card fade-up" style="animation-delay:.16s">
    <div style="font-size:12px;font-weight:500;margin-bottom:6px">🚀 Déploiement iPhone (GitHub Pages)</div>
    <div style="font-size:11px;color:var(--text2);line-height:1.8">
      1. github.com → New repository → <b style="color:var(--text)">rugby-perf</b><br>
      2. Upload files → glisse le contenu du ZIP<br>
      3. Settings → Pages → Branch: main → Save<br>
      4. URL: <b style="color:var(--accent)">pseudo.github.io/rugby-perf</b><br>
      5. iPhone Safari → Partager → <b style="color:var(--text)">Sur l'écran d'accueil</b> ✓
    </div>
  </div>
  </div>`;
  renderMemoList();
}

function saveProfile(){
  const s=Storage.get();
  s.profile.weight=parseFloat(document.getElementById('p-weight')?.value)||s.profile.weight;
  s.profile.targetWeight=parseFloat(document.getElementById('p-target')?.value)||s.profile.targetWeight;
  Storage.save(s);toast('Profil enregistré ✓','success');
}

function saveDeezer(){
  const s=Storage.get();
  s.profile.deezerPlaylistUrl=document.getElementById('deezer-url')?.value?.trim()||'';
  s.profile.deezerPlaylistName=document.getElementById('deezer-name')?.value?.trim()||'Ma playlist';
  Storage.save(s);toast('Deezer enregistré ✓','success');renderProfile();
}

function openDeezer(){
  const url=Storage.get().profile.deezerPlaylistUrl;
  if(url)window.open(url,'_blank');
  else toast('Configure d\'abord ta playlist dans Profil','warn');
}

function saveNutritionGoals(){
  const goals={
    kcal:parseInt(document.getElementById('goal-kcal')?.value)||3100,
    protein:parseInt(document.getElementById('goal-prot')?.value)||140,
    carbs:parseInt(document.getElementById('goal-carb')?.value)||420,
    fat:parseInt(document.getElementById('goal-fat')?.value)||70
  };
  Storage.saveNutritionGoals(goals);toast('Objectifs enregistrés ✓','success');
}

async function setupNotif(){
  if(await Notif.request()){Notif.scheduleGym();toast('Notifications activées ✓','success');renderProfile();}
  else toast('Autorisations refusées — réglages iPhone','warn',4000);
}

function addMemo(){
  const v=document.getElementById('memo-inp')?.value?.trim();if(!v)return;
  Storage.addGlobalMemo(v);document.getElementById('memo-inp').value='';
  toast('Note ajoutée ✓','success');renderMemoList();
}

function renderMemoList(){
  const el=document.getElementById('memo-list');if(!el)return;
  const memos=Storage.get().globalMemos||[];
  el.innerHTML=memos.slice(0,6).map(m=>`<div class="note-item"><div class="note-date">${fmtDate(m.date)}</div><div class="note-text">${m.text}</div></div>`).join('')||`<div class="note-text" style="color:var(--text3)">Aucune note.</div>`;
}

function triggerImport(mode){document.getElementById(`imp-${mode}`)?.click();}
function doImport(inp,mode){
  const file=inp.files[0];if(!file)return;
  const r=new FileReader();
  r.onload=e=>{
    const res=mode==='replace'?Storage.importReplace(e.target.result):Storage.importMerge(e.target.result);
    if(res.ok){
      haptic('success');
      if(mode==='replace'){toast('Restauré ✓ Rechargement...','success',2000);setTimeout(()=>location.reload(),2100);}
      else{toast(`+${res.added.sessions} séances, +${res.added.weights} poids importés`,'success',3500);renderProfile();}
    }else{haptic('heavy');toast(res.error,'error',4000);}
    inp.value='';
  };
  r.readAsText(file);
}

function showDeloadInfo(){toast('Deload = charges -10%, mêmes séries. Le SNC récupère et tu progresses plus fort ensuite.','info',5000);}

// ===== INIT =====
document.addEventListener('DOMContentLoaded',()=>{
  curDayIdx=new Date().getDay()===0?6:new Date().getDay()-1;
  nav('home');
});
