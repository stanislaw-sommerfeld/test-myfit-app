const AI = {
  predictSets(exId, pattern='flat'){
    const ex = EXERCISES[exId];
    if(!ex) return [];
    const hist = Storage.getExHistory(exId);
    const fatigue = Storage.getFatigue();
    const fatigMult = fatigue>7?0.95:fatigue>5?1.0:1.02;
    let baseWeight = ex.baseWeight;
    if(hist.length>=2){
      const maxWeights = hist.slice(-6).map(h=>Math.max(...(h.sets||[]).map(s=>s.weight||0),0));
      let ema = maxWeights[0];
      for(let i=1;i<maxWeights.length;i++) ema = 0.35*maxWeights[i]+0.65*ema;
      const vel = maxWeights.length>=2 ? (maxWeights[maxWeights.length-1]-maxWeights[0])/(maxWeights.length-1) : ex.progressionRate;
      const lastRpe = hist[hist.length-1]?.sessionRpe||7;
      const rpeMult = lastRpe<=6?1.06:lastRpe<=7.5?1.025:lastRpe<=8.5?1.0:0.95;
      baseWeight = Math.round((ema + vel*rpeMult*fatigMult) / ex.progressionRate) * ex.progressionRate;
      baseWeight = Math.max(ex.baseWeight, baseWeight);
    }
    const sets = parseInt(ex.sets)||4;
    const reps = ex.reps;
    switch(pattern){
      case 'pyramid':{
        const mid=Math.ceil(sets/2);
        return Array.from({length:sets},(_,i)=>{const d=Math.abs(i-(mid-1));const w=Math.round((baseWeight*(1-d*0.07))/ex.progressionRate)*ex.progressionRate;return{weight:Math.max(ex.baseWeight,w),reps:reps,done:false};});
      }
      case 'ascending':{
        return Array.from({length:sets},(_,i)=>{const w=Math.round((baseWeight*(0.82+i*0.06))/ex.progressionRate)*ex.progressionRate;return{weight:Math.max(ex.baseWeight,w),reps:reps,done:false};});
      }
      case 'descending':{
        return Array.from({length:sets},(_,i)=>{const w=Math.round((baseWeight*(1.0-i*0.06))/ex.progressionRate)*ex.progressionRate;return{weight:Math.max(ex.baseWeight,w),reps:reps,done:false};});
      }
      case 'drop':{
        return Array.from({length:sets},(_,i)=>{const w=i===sets-1?Math.round(baseWeight*0.75/ex.progressionRate)*ex.progressionRate:baseWeight;const r=i===sets-1?String(parseInt(reps||'8')+4):reps;return{weight:Math.max(ex.baseWeight,w),reps:r,done:false};});
      }
      default:{
        return Array.from({length:sets},()=>({weight:baseWeight>0?baseWeight:0,reps:reps,done:false}));
      }
    }
  },

  projectFuture(exId,n=6){
    const hist=Storage.getExHistory(exId);
    const ex=EXERCISES[exId];if(!ex)return[];
    const fake=[...hist];
    return Array.from({length:n},(_,i)=>{
      const sets=this.predictSets(exId);
      const maxW=Math.max(...sets.map(s=>s.weight||0));
      fake.push({date:new Date(),sets,pattern:'flat',sessionRpe:7});
      return{session:i+1,weight:maxW};
    });
  },

  projectBodyWeight(cur,target,surplus=350){
    const kgW=surplus/7700*7;const weeks=Math.ceil((target-cur)/kgW);
    return{points:Array.from({length:weeks+3},(_,i)=>({week:i,weight:Math.min(target+0.3,+(cur+i*kgW).toFixed(2))})),weeksNeeded:weeks,kgPerWeek:kgW.toFixed(2)};
  },

  shouldDeload(sessions){
    if(!sessions||sessions.length<4)return false;
    const r=sessions.slice(0,4);
    return r.filter(s=>(s.sessionRpe||7)>=8.5).length>=3||r.filter(s=>!s.completed).length>=2;
  },

  weekAnalysis(sessions){
    if(!sessions||!sessions.length)return{avgRpe:'—',recommendation:'Commence le suivi pour des recommandations personnalisées.'};
    const avg=(sessions.map(s=>s.sessionRpe||7).reduce((a,b)=>a+b,0)/sessions.length).toFixed(1);
    let rec='';
    if(+avg>8.5)rec='🔴 Semaine très chargée — deload recommandé (charges -10%).';
    else if(+avg>7.5)rec='🟡 Bonne intensité — maintiens, ajoute une série si tu te sens bien.';
    else if(+avg<6)rec='🟢 Trop facile — augmente les charges de 5-8%.';
    else rec='✅ Progression optimale — continue.';
    return{avgRpe:avg,recommendation:rec};
  },

  async analyzeExerciseNotes(exId){
    const notes=Storage.getExNotes(exId);
    const hist=Storage.getExHistory(exId);
    const ex=EXERCISES[exId];
    const cached=Storage.getInsight(exId);
    if(cached&&(Date.now()-new Date(cached.date).getTime())<6*3600*1000)return cached.text;
    const notesText=notes.slice(0,8).map(n=>`[${new Date(n.date).toLocaleDateString('fr-FR')}] ${n.text}`).join('\n');
    const histText=hist.slice(-5).map(h=>{const maxW=Math.max(...(h.sets||[]).map(s=>s.weight||0),0);const totalR=(h.sets||[]).reduce((a,s)=>a+(parseInt(s.reps)||0),0);return`${new Date(h.date).toLocaleDateString('fr-FR')}: max ${maxW}kg, ${totalR} reps, pattern:${h.pattern||'flat'}, RPE:${h.sessionRpe||'?'}`;}).join('\n');
    const prompt=`Tu es coach rugby expert. Analyse l'exercice "${ex?.name||exId}" pour un joueur rugby demi/ouverture (1m78, ~65kg, objectif 70kg).\n\nNotes:\n${notesText||'aucune'}\n\nHistorique:\n${histText||'aucun'}\n\nAnalyse en 3-4 phrases: ce qui ressort, conseil technique, recommandation charges/séries prochaine séance. Français, direct, actionnable.`;
    try{
      const res=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:300,messages:[{role:'user',content:prompt}]})});
      const data=await res.json();
      const text=data.content?.[0]?.text||'';
      if(text){Storage.saveInsight(exId,text);return text;}
    }catch(e){console.warn('AI fail:',e);}
    return null;
  },

  async optimizeSession(dayIdx){
    const day=WEEKLY_PROGRAM[dayIdx];
    if(!day?.exercises?.length)return null;
    const summaries=day.exercises.map(exId=>{const hist=Storage.getExHistory(exId);const ex=EXERCISES[exId];if(!hist.length)return`${ex?.name}: nouveau`;const last=hist[hist.length-1];const maxW=Math.max(...(last.sets||[]).map(s=>s.weight||0),0);return`${ex?.name}: max ${maxW}kg, RPE ${last.sessionRpe||'?'}, ${last.pattern||'flat'}`;}).join('\n');
    const fatigue=Storage.getFatigue();
    const prompt=`Coach rugby. Séance "${day.label}". Fatigue: ${fatigue}/10.\n${summaries}\n\nAjustements pour cette séance en 2-3 phrases. Direct, précis sur les charges.`;
    try{
      const res=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:200,messages:[{role:'user',content:prompt}]})});
      const data=await res.json();
      return data.content?.[0]?.text||null;
    }catch(e){return null;}
  }
};
