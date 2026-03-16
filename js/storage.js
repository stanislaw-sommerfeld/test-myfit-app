const Storage = {
  VERSION:'3.0', KEY:'rugby_v3',

  get(){try{const r=localStorage.getItem(this.KEY);return r?JSON.parse(r):this.defaults()}catch{return this.defaults()}},
  save(s){try{localStorage.setItem(this.KEY,JSON.stringify(s));return true}catch{return false}},

  defaults(){
    return{
      version:this.VERSION,
      profile:{weight:65,targetWeight:70,height:178,startDate:new Date().toISOString(),
               deezerPlaylistUrl:'',deezerPlaylistName:'Ma playlist entraînement'},
      weightLog:[{date:new Date().toISOString(),weight:65}],
      sessionLogs:[],   // full session objects with series detail
      exerciseNotes:{}, // { exId: [{date,text,sessionId}] }
      fatigue:5,
      globalMemos:[],
      nutrition:{
        log:[],         // [{date, meals:[{name,emoji,items:[{name,kcal,p,c,f,qty,unit}]}]}]
        goals:{kcal:3100,protein:140,carbs:420,fat:70}
      },
      aiInsights:[]     // cached AI analysis results
    };
  },

  // ===== WEIGHT =====
  logWeight(w){const s=this.get();s.weightLog.push({date:new Date().toISOString(),weight:w});s.profile.weight=w;this.save(s)},

  // ===== SESSIONS =====
  // sessionData: {dayIndex, dayLabel, duration, sessionRpe, exercises:[{id, sets:[{weight,reps,rpe,done}], pattern, note}], completed}
  logSession(data){
    const s=this.get();
    const entry={...data,id:Date.now(),date:new Date().toISOString()};
    s.sessionLogs.unshift(entry);
    if(s.sessionLogs.length>120)s.sessionLogs=s.sessionLogs.slice(0,120);
    // propagate per-exercise notes
    for(const ex of(data.exercises||[])){
      if(ex.note&&ex.note.trim()){
        if(!s.exerciseNotes[ex.id])s.exerciseNotes[ex.id]=[];
        s.exerciseNotes[ex.id].unshift({date:new Date().toISOString(),text:ex.note,sessionId:entry.id});
      }
    }
    this.save(s);return entry.id;
  },

  // ===== EXERCISE HISTORY =====
  // Returns array of {date, sets:[{weight,reps,rpe,done}], pattern, note, sessionId}
  getExHistory(exId){
    const s=this.get();const out=[];
    for(const sess of s.sessionLogs){
      const ex=(sess.exercises||[]).find(e=>e.id===exId);
      if(ex)out.push({date:sess.date,sets:ex.sets||[],pattern:ex.pattern||'flat',note:ex.note||'',sessionId:sess.id,sessionRpe:sess.sessionRpe});
    }
    return out.reverse(); // oldest first
  },

  // last weight used for exercise (top weight in last session)
  getLastWeight(exId){
    const hist=this.getExHistory(exId);
    if(!hist.length)return null;
    const last=hist[hist.length-1];
    const weights=(last.sets||[]).map(s=>s.weight||0).filter(w=>w>0);
    return weights.length?Math.max(...weights):null;
  },

  // ===== NOTES =====
  getExNotes(exId){return(this.get().exerciseNotes[exId]||[]).slice(0,20)},
  addGlobalMemo(text){const s=this.get();s.globalMemos.unshift({id:Date.now(),date:new Date().toISOString(),text});this.save(s)},

  // ===== NUTRITION =====
  getTodayNutrition(){
    const s=this.get();
    const today=new Date().toDateString();
    return s.nutrition.log.find(d=>new Date(d.date).toDateString()===today)||null;
  },
  saveTodayNutrition(dayData){
    const s=this.get();
    const today=new Date().toDateString();
    const idx=s.nutrition.log.findIndex(d=>new Date(d.date).toDateString()===today);
    if(idx>=0)s.nutrition.log[idx]=dayData;
    else s.nutrition.log.unshift(dayData);
    if(s.nutrition.log.length>60)s.nutrition.log=s.nutrition.log.slice(0,60);
    this.save(s);
  },
  getNutritionGoals(){return this.get().nutrition.goals},
  saveNutritionGoals(g){const s=this.get();s.nutrition.goals=g;this.save(s)},

  // ===== AI INSIGHTS CACHE =====
  saveInsight(exId,text){const s=this.get();s.aiInsights=s.aiInsights.filter(i=>i.exId!==exId);s.aiInsights.unshift({exId,text,date:new Date().toISOString()});if(s.aiInsights.length>30)s.aiInsights=s.aiInsights.slice(0,30);this.save(s)},
  getInsight(exId){return(this.get().aiInsights.find(i=>i.exId===exId))||null},

  // ===== FATIGUE =====
  setFatigue(n){const s=this.get();s.fatigue=n;this.save(s)},
  getFatigue(){return this.get().fatigue||5},

  // ===== IMPORT / EXPORT =====
  exportData(){
    const data=this.get();
    const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download=`rugby-perf-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(url);
  },
  importMerge(json){
    try{
      const inc=JSON.parse(json);
      if(!inc.profile||!inc.sessionLogs)return{ok:false,error:'Fichier invalide'};
      const cur=this.get();
      const existIds=new Set(cur.sessionLogs.map(s=>s.id));
      const newSess=inc.sessionLogs.filter(s=>!existIds.has(s.id));
      const existDates=new Set(cur.weightLog.map(w=>w.date));
      const newW=inc.weightLog.filter(w=>!existDates.has(w.date));
      // merge exercise notes
      const mergedNotes={...cur.exerciseNotes};
      for(const[exId,notes] of Object.entries(inc.exerciseNotes||{})){
        mergedNotes[exId]=([...(mergedNotes[exId]||[]),...notes]).sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,50);
      }
      const merged={...cur,profile:inc.profile,
        weightLog:[...cur.weightLog,...newW].sort((a,b)=>new Date(a.date)-new Date(b.date)),
        sessionLogs:[...newSess,...cur.sessionLogs].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,120),
        exerciseNotes:mergedNotes,
        globalMemos:[...(inc.globalMemos||[]),...cur.globalMemos].slice(0,200)};
      this.save(merged);
      return{ok:true,added:{sessions:newSess.length,weights:newW.length}};
    }catch(e){return{ok:false,error:e.message}}
  },
  importReplace(json){
    try{const inc=JSON.parse(json);if(!inc.profile)return{ok:false,error:'Fichier invalide'};this.save(inc);return{ok:true}}
    catch(e){return{ok:false,error:e.message}}
  },
  reset(){localStorage.removeItem(this.KEY);location.reload()}
};

// ===== NOTIFICATIONS =====
const Notif={
  async request(){if(!('Notification'in window))return false;return(await Notification.requestPermission())==='granted'},
  send(title,body,delay=0){if(Notification.permission!=='granted')return;setTimeout(()=>new Notification(title,{body}),delay)},
  scheduleGym(){
    const now=new Date();
    [[2,'Force Lower Body'],[5,'Force Upper Body'],[6,'Full Body']].forEach(([day,label])=>{
      const next=new Date(now);const du=(day-now.getDay()+7)%7||7;
      next.setDate(now.getDate()+du);next.setHours(8,0,0,0);
      const delay=next-now;if(delay>0)this.send('💪 '+label+' demain','Prépare ta séance. Mange bien ce soir.',delay);
    });
  }
};
