// ===== SVG EXERCISE ANIMATIONS =====
// Each animation: stick figure showing movement phases + muscle highlight overlay
// Uses requestAnimationFrame for smooth 60fps animation

const ExerciseAnimations = {

  // ---- SQUAT ----
  'squat-barre': {
    phases: ['Départ debout', 'Descente — dos droit, genoux alignés', 'Bas du squat — cuisses parallèles', 'Remontée explosive'],
    cues: [
      { phase: 0, text: 'Barre sur les trapèzes, pieds largeur épaules' },
      { phase: 1, text: '⚠️ Garde le dos droit — ne te penche pas en avant' },
      { phase: 2, text: '✓ Cuisses parallèles au sol = amplitude correcte' },
      { phase: 3, text: '🔥 Pousse le sol vers le bas, ne tire pas vers le haut' }
    ],
    muscles: { primary: ['quad'], secondary: ['glute', 'hamstring', 'core'] },
    render(container, progress) {
      const t = progress; // 0→1 over full cycle
      // Phase: 0-0.25 standing, 0.25-0.5 descending, 0.5-0.75 bottom, 0.75-1 ascending
      let phase, kneeAngle, hipAngle, torsoLean, barY;
      if (t < 0.25) {
        phase = 0; kneeAngle = 0; hipAngle = 0; torsoLean = 0; barY = 0;
      } else if (t < 0.5) {
        const p = (t - 0.25) / 0.25;
        phase = 1; kneeAngle = p * 90; hipAngle = p * 60; torsoLean = p * 15; barY = p * 55;
      } else if (t < 0.6) {
        phase = 2; kneeAngle = 90; hipAngle = 60; torsoLean = 15; barY = 55;
      } else if (t < 0.85) {
        const p = (t - 0.6) / 0.25;
        phase = 3; kneeAngle = 90 * (1-p); hipAngle = 60 * (1-p); torsoLean = 15*(1-p); barY = 55*(1-p);
      } else {
        phase = 0; kneeAngle = 0; hipAngle = 0; torsoLean = 0; barY = 0;
      }

      const cue = this.cues.find(c => c.phase === phase) || this.cues[0];
      const mActive = kneeAngle > 20;

      container.innerHTML = buildSquatSVG(kneeAngle, hipAngle, torsoLean, barY, mActive, cue.text, this.phases[phase]);
    }
  },

  // ---- DEADLIFT ----
  'deadlift': {
    phases: ['Position départ — barre au-dessus du pied', 'Tirage — jambes poussent le sol', 'Verrouillage debout', 'Descente contrôlée'],
    cues: [
      { phase: 0, text: 'Barre à 2cm des tibias. Dos plat, regard légèrement bas.' },
      { phase: 1, text: '⚠️ Pousse le sol — ne tire PAS avec le dos' },
      { phase: 2, text: '✓ Hanches et épaules montent ensemble jusqu\'au verrouillage' },
      { phase: 3, text: 'Descente lente et contrôlée — ne pas lâcher' }
    ],
    muscles: { primary: ['hamstring', 'glute', 'back'], secondary: ['quad', 'trap', 'core'] },
    render(container, progress) {
      let phase, liftPct, barY, hipH;
      if (progress < 0.15) {
        phase = 0; liftPct = 0; barY = 70; hipH = 35;
      } else if (progress < 0.55) {
        const p = (progress - 0.15) / 0.4;
        phase = 1; liftPct = p; barY = 70 - p * 70; hipH = 35 + p * 30;
      } else if (progress < 0.7) {
        phase = 2; liftPct = 1; barY = 0; hipH = 65;
      } else {
        const p = (progress - 0.7) / 0.3;
        phase = 3; liftPct = 1 - p; barY = p * 70; hipH = 65 - p * 30;
      }
      const cue = this.cues.find(c => c.phase === phase) || this.cues[0];
      container.innerHTML = buildDeadliftSVG(liftPct, barY, hipH, cue.text, this.phases[phase]);
    }
  },

  // ---- BENCH PRESS ----
  'bench-press': {
    phases: ['Position — omoplates serrées', 'Descente vers le sternum', 'Contact — coudes à 75°', 'Poussée en arc'],
    cues: [
      { phase: 0, text: 'Serre les omoplates, pieds à plat — crée une base stable' },
      { phase: 1, text: '⚠️ Descendre vers le MILIEU du sternum, pas le cou' },
      { phase: 2, text: 'Coudes à 75° du corps — protège les épaules' },
      { phase: 3, text: '🔥 Pousser en arc, pas verticalement' }
    ],
    muscles: { primary: ['chest'], secondary: ['tricep', 'front-delt'] },
    render(container, progress) {
      let phase, barY, armAngle;
      if (progress < 0.15) { phase = 0; barY = 0; armAngle = 0; }
      else if (progress < 0.45) { const p=(progress-0.15)/0.3; phase=1; barY=p*40; armAngle=p*45; }
      else if (progress < 0.55) { phase=2; barY=40; armAngle=45; }
      else if (progress < 0.85) { const p=(progress-0.55)/0.3; phase=3; barY=40*(1-p); armAngle=45*(1-p); }
      else { phase=0; barY=0; armAngle=0; }
      const cue = this.cues.find(c=>c.phase===phase) || this.cues[0];
      container.innerHTML = buildBenchSVG(barY, armAngle, cue.text, this.phases[phase]);
    }
  },

  // ---- PULL-UP ----
  'tractions': {
    phases: ['Suspension bras tendus', 'Initiation — omoplates vers le bas', 'Tirage — coudes vers les hanches', 'Haut — menton au-dessus'],
    cues: [
      { phase: 0, text: 'Bras complètement tendus — amplitude complète' },
      { phase: 1, text: '⚠️ Initier avec les omoplates, pas les biceps' },
      { phase: 2, text: '🔥 Pense "coudes vers les poches de pantalon"' },
      { phase: 3, text: '✓ Descente lente — 3 secondes minimum' }
    ],
    muscles: { primary: ['lat', 'back'], secondary: ['bicep', 'rear-delt'] },
    render(container, progress) {
      let phase, pullPct;
      if (progress < 0.15) { phase=0; pullPct=0; }
      else if (progress < 0.5) { const p=(progress-0.15)/0.35; phase=p<0.3?1:2; pullPct=p; }
      else if (progress < 0.65) { phase=3; pullPct=1; }
      else { const p=(progress-0.65)/0.35; phase=3; pullPct=1-p; }
      const cue = this.cues.find(c=>c.phase===phase) || this.cues[0];
      container.innerHTML = buildPullupSVG(pullPct, cue.text, this.phases[phase]);
    }
  },

  // ---- OVERHEAD PRESS ----
  'overhead-press': {
    phases: ['Barre sur les clavicules', 'Tête passe la barre', 'Verrouillage au-dessus', 'Retour contrôlé'],
    cues: [
      { phase: 0, text: 'Coudes légèrement devant la barre. Core verrouillé.' },
      { phase: 1, text: '✓ La tête recule pour laisser passer la barre' },
      { phase: 2, text: '🔥 Bras complètement verrouillés — ne triche pas' },
      { phase: 3, text: '⚠️ Ne creuse pas le dos en descendant' }
    ],
    muscles: { primary: ['front-delt', 'mid-delt'], secondary: ['tricep', 'trap', 'core'] },
    render(container, progress) {
      let phase, barH, headShift;
      if (progress < 0.15) { phase=0; barH=0; headShift=0; }
      else if (progress < 0.5) { const p=(progress-0.15)/0.35; phase=p<0.5?1:2; barH=p; headShift=p*10; }
      else if (progress < 0.65) { phase=2; barH=1; headShift=5; }
      else { const p=(progress-0.65)/0.35; phase=3; barH=1-p; headShift=(1-p)*5; }
      const cue = this.cues.find(c=>c.phase===phase) || this.cues[0];
      container.innerHTML = buildOHPressSVG(barH, headShift, cue.text, this.phases[phase]);
    }
  },

  // ---- HIP THRUST ----
  'hip-thrust': {
    phases: ['Position de départ', 'Montée — pousser par les talons', 'Haut — fessiers contractés', 'Descente contrôlée'],
    cues: [
      { phase: 0, text: 'Haut du dos sur le banc. Barre sur les hanches.' },
      { phase: 1, text: '🔥 Pousse par les TALONS — pas les orteils' },
      { phase: 2, text: '⚠️ PINCE les fessiers en haut. Tiens 1 seconde.' },
      { phase: 3, text: 'Descente lente — ne pas laisser tomber les hanches' }
    ],
    muscles: { primary: ['glute'], secondary: ['hamstring', 'core'] },
    render(container, progress) {
      let phase, hipH;
      if (progress < 0.15) { phase=0; hipH=0; }
      else if (progress < 0.45) { const p=(progress-0.15)/0.3; phase=1; hipH=p; }
      else if (progress < 0.6) { phase=2; hipH=1; }
      else { const p=(progress-0.6)/0.4; phase=3; hipH=1-p; }
      const cue = this.cues.find(c=>c.phase===phase) || this.cues[0];
      container.innerHTML = buildHipThrustSVG(hipH, cue.text, this.phases[phase]);
    }
  },

  // ---- NORDIC CURL ----
  'nordic-curl': {
    phases: ['Position genoux', 'Descente lente — 6 secondes', 'Bas — atterrissage mains', 'Remontée assistée'],
    cues: [
      { phase: 0, text: 'Genoux sur coussin. Chevilles bloquées. Corps droit.' },
      { phase: 1, text: '🔥 DESCENTE LA PLUS LENTE POSSIBLE — c\'est l\'exercice' },
      { phase: 2, text: 'Mains pour amortir. Les ischios sont à leur maximum.' },
      { phase: 3, text: 'Aide avec les bras pour remonter — c\'est normal' }
    ],
    muscles: { primary: ['hamstring'], secondary: ['glute', 'core'] },
    render(container, progress) {
      let phase, fallAngle;
      if (progress < 0.1) { phase=0; fallAngle=0; }
      else if (progress < 0.65) { const p=(progress-0.1)/0.55; phase=p<0.95?1:2; fallAngle=p*85; }
      else if (progress < 0.75) { phase=2; fallAngle=85; }
      else { const p=(progress-0.75)/0.25; phase=3; fallAngle=85*(1-p); }
      const cue = this.cues.find(c=>c.phase===phase) || this.cues[0];
      container.innerHTML = buildNordicSVG(fallAngle, cue.text, this.phases[phase]);
    }
  },

  // ---- FACE PULL ----
  'face-pull': {
    phases: ['Bras tendus vers la poulie', 'Tirage vers le visage', 'Fin — pouces derrière', 'Retour contrôlé'],
    cues: [
      { phase: 0, text: 'Poulie haute. Corps légèrement incliné en arrière.' },
      { phase: 1, text: '⚠️ Coudes restent à hauteur d\'épaules ou plus haut' },
      { phase: 2, text: '🔥 Pouces pointent derrière toi — rotation externe maximale' },
      { phase: 3, text: 'Retour LENT — ne pas lâcher' }
    ],
    muscles: { primary: ['rear-delt', 'rhomboid'], secondary: ['trap', 'rotator'] },
    render(container, progress) {
      let phase, pullPct;
      if (progress < 0.15) { phase=0; pullPct=0; }
      else if (progress < 0.5) { const p=(progress-0.15)/0.35; phase=p<0.7?1:2; pullPct=p; }
      else if (progress < 0.65) { phase=2; pullPct=1; }
      else { const p=(progress-0.65)/0.35; phase=3; pullPct=1-p; }
      const cue = this.cues.find(c=>c.phase===phase) || this.cues[0];
      container.innerHTML = buildFacePullSVG(pullPct, cue.text, this.phases[phase]);
    }
  }
};

// ===== SVG BUILDERS =====

function svgWrap(content, w=300, h=340) {
  return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;max-height:300px">${content}</svg>`;
}

function muscleDot(x, y, active, color='#1D9E75', r=8) {
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="${active?color:'rgba(255,255,255,0.08)'}" opacity="${active?0.9:1}">
    ${active ? `<animate attributeName="r" values="${r};${r+3};${r}" dur="1s" repeatCount="indefinite"/>` : ''}
  </circle>`;
}

function cueBox(text, y=310) {
  const safe = text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  // Word wrap at ~38 chars
  const words = safe.split(' ');
  const lines = [];
  let line = '';
  for (const w of words) {
    if ((line+' '+w).trim().length > 38) { lines.push(line.trim()); line = w; }
    else line = (line+' '+w).trim();
  }
  if (line) lines.push(line.trim());
  const boxH = 16 + lines.length * 16;
  const boxY = y - boxH + 4;
  return `
    <rect x="8" y="${boxY}" width="284" height="${boxH}" rx="6" fill="rgba(29,158,117,0.15)" stroke="rgba(29,158,117,0.4)" stroke-width="0.5"/>
    ${lines.map((l,i)=>`<text x="16" y="${boxY+14+i*16}" font-family="system-ui,sans-serif" font-size="11" fill="#5DCAA5">${l}</text>`).join('')}`;
}

function phaseLabel(text, phase) {
  const colors = ['#8a8a92','#378ADD','#1D9E75','#e8a020'];
  const safe = text.replace(/&/g,'&amp;').replace(/</g,'&lt;');
  return `<rect x="8" y="8" width="${Math.min(280, safe.length*7+16)}" height="20" rx="4" fill="${colors[phase]||colors[0]}22"/>
    <text x="16" y="21" font-family="system-ui,sans-serif" font-size="11" font-weight="600" fill="${colors[phase]||colors[0]}">${safe}</text>`;
}

// Stick figure helpers
function head(cx, cy, r=14) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#f0f0f2" stroke-width="2"/>`;
}
function joint(cx, cy, r=4, color='#f0f0f2') {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}"/>`;
}
function limb(x1,y1,x2,y2,w=2.5,color='#f0f0f2') {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${w}" stroke-linecap="round"/>`;
}
function bar(x1,y1,x2,y2) {
  return `<rect x="${x1-3}" y="${y1-3}" width="${x2-x1+6}" height="6" rx="3" fill="#B4B2A9"/>
    <circle cx="${x1}" cy="${y1}" r="9" fill="none" stroke="#888780" stroke-width="3"/>
    <circle cx="${x2}" cy="${y2}" r="9" fill="none" stroke="#888780" stroke-width="3"/>`;
}

// ===== SQUAT SVG =====
function buildSquatSVG(kneeAngle, hipAngle, torsoLean, barDropY, musclesActive, cueText, phaseName) {
  const cx = 150;
  // Standing: head=60, shoulder=95, hip=155, knee=205, ankle=255
  const headY = 62 + barDropY * 0.3;
  const shoulderY = 95 + barDropY * 0.4;
  const hipY = 155 + barDropY * 0.5;
  const kneeY = 205 + barDropY * 0.1;
  const ankleY = 255;

  const leanRad = (torsoLean * Math.PI) / 180;
  const shoulderX = cx + Math.sin(leanRad) * 25;
  const hipX = cx - Math.sin(leanRad) * 10;

  // Muscle overlay: quads (front thigh area)
  const quadActive = kneeAngle > 20;
  const gluteActive = kneeAngle > 40;

  return svgWrap(`
    ${phaseLabel(phaseName, kneeAngle < 10 ? 0 : kneeAngle < 60 ? 1 : kneeAngle >= 85 ? 2 : 3)}

    ${quadActive ? `<ellipse cx="${cx}" cy="${(hipY+kneeY)/2}" rx="16" ry="${(kneeY-hipY)/2*0.8}" fill="rgba(29,158,117,0.25)" stroke="rgba(29,158,117,0.6)" stroke-width="1">
      <animate attributeName="opacity" values="0.7;1;0.7" dur="0.8s" repeatCount="indefinite"/>
    </ellipse>` : ''}
    ${gluteActive ? `<ellipse cx="${hipX}" cy="${hipY-5}" rx="18" ry="14" fill="rgba(232,160,32,0.2)" stroke="rgba(232,160,32,0.5)" stroke-width="1"/>` : ''}

    ${bar(cx-60, shoulderY-2, cx+60, shoulderY-2)}
    ${head(cx, headY)}
    ${limb(cx, headY+14, shoulderX, shoulderY)}
    ${limb(shoulderX, shoulderY, hipX, hipY)}
    ${limb(hipX, hipY, cx-12, kneeY)}
    ${limb(cx-12, kneeY, cx-12, ankleY)}
    ${limb(hipX, hipY, cx+12, kneeY)}
    ${limb(cx+12, kneeY, cx+12, ankleY)}
    ${limb(shoulderX, shoulderY, cx-35, shoulderY+30)}
    ${limb(shoulderX, shoulderY, cx+35, shoulderY+30)}
    ${limb(cx-12, ankleY, cx-30, ankleY+6)}
    ${limb(cx+12, ankleY, cx+30, ankleY+6)}

    ${quadActive ? muscleDot(cx+20, (hipY+kneeY)/2, true, '#1D9E75', 6) : ''}
    ${gluteActive ? muscleDot(hipX+10, hipY, true, '#e8a020', 6) : ''}

    ${cueBox(cueText, 298)}
  `);
}

// ===== DEADLIFT SVG =====
function buildDeadliftSVG(liftPct, barY, hipH, cueText, phaseName) {
  const cx = 150;
  const floorY = 250;
  const barActualY = floorY - barY;

  const standH = 60 + liftPct * 80;
  const headY = floorY - standH - 20;
  const shoulderY = floorY - standH + 10;
  const hipActualY = floorY - hipH;

  const backActive = liftPct > 0.1 && liftPct < 0.9;
  const hamActive = liftPct < 0.7;

  return svgWrap(`
    ${phaseLabel(phaseName, liftPct < 0.1 ? 0 : liftPct < 0.8 ? 1 : liftPct >= 0.95 ? 2 : 3)}

    <line x1="0" y1="${floorY}" x2="300" y2="${floorY}" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>

    ${backActive ? `<ellipse cx="${(cx+shoulderY*0.05)|0}" cy="${(shoulderY+hipActualY)/2}" rx="14" ry="${Math.abs(hipActualY-shoulderY)/2*0.7}" fill="rgba(55,138,221,0.2)" stroke="rgba(55,138,221,0.5)" stroke-width="1">
      <animate attributeName="opacity" values="0.6;1;0.6" dur="0.9s" repeatCount="indefinite"/>
    </ellipse>` : ''}
    ${hamActive ? `<ellipse cx="${cx-10}" cy="${(hipActualY+floorY-20)/2}" rx="13" ry="${(floorY-20-hipActualY)/2*0.7}" fill="rgba(29,158,117,0.2)" stroke="rgba(29,158,117,0.5)" stroke-width="1"/>` : ''}

    ${bar(cx-65, barActualY, cx+65, barActualY)}
    ${head(cx, headY)}
    ${limb(cx, headY+14, cx, shoulderY)}
    ${limb(cx, shoulderY, cx-5, hipActualY)}
    ${limb(cx-5, hipActualY, cx-15, floorY-15)}
    ${limb(cx-15, floorY-15, cx-20, floorY)}
    ${limb(cx-5, hipActualY, cx+10, floorY-15)}
    ${limb(cx+10, floorY-15, cx+15, floorY)}
    ${limb(cx, shoulderY, cx-40, barActualY+5)}
    ${limb(cx, shoulderY, cx+40, barActualY+5)}

    ${cueBox(cueText, 298)}
  `);
}

// ===== BENCH PRESS SVG =====
function buildBenchSVG(barDrop, armAngle, cueText, phaseName) {
  const cx = 150;
  const benchY = 200;
  const barBaseY = 140;
  const barActualY = barBaseY + barDrop;

  const chestActive = barDrop > 15;
  const armRad = armAngle * Math.PI / 180;

  return svgWrap(`
    ${phaseLabel(phaseName, barDrop < 5 ? 0 : barDrop < 25 ? 1 : barDrop >= 38 ? 2 : 3)}

    <rect x="60" y="${benchY}" width="180" height="18" rx="4" fill="#1a1a1e" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>

    ${chestActive ? `<ellipse cx="${cx}" cy="${benchY-15}" rx="30" ry="12" fill="rgba(29,158,117,0.25)" stroke="rgba(29,158,117,0.6)" stroke-width="1">
      <animate attributeName="opacity" values="0.7;1;0.7" dur="0.8s" repeatCount="indefinite"/>
    </ellipse>` : ''}

    ${head(cx, benchY-60)}
    <rect x="${cx-22}" y="${benchY-45}" width="44" height="48" rx="6" fill="none" stroke="#f0f0f2" stroke-width="2"/>
    ${limb(cx-22, benchY-10, cx-55, benchY-10+barDrop*0.3)}
    ${limb(cx+22, benchY-10, cx+55, benchY-10+barDrop*0.3)}
    ${limb(cx-55, benchY-10+barDrop*0.3, cx-55, barActualY)}
    ${limb(cx+55, benchY-10+barDrop*0.3, cx+55, barActualY)}
    ${bar(cx-80, barActualY, cx+80, barActualY)}
    ${joint(cx-55, barActualY, 4, '#1D9E75')}
    ${joint(cx+55, barActualY, 4, '#1D9E75')}
    <line x1="${cx-22}" y1="${benchY}" x2="${cx-22}" y2="${benchY+40}" stroke="#f0f0f2" stroke-width="2"/>
    <line x1="${cx+22}" y1="${benchY}" x2="${cx+22}" y2="${benchY+40}" stroke="#f0f0f2" stroke-width="2"/>

    ${cueBox(cueText, 298)}
  `);
}

// ===== PULL-UP SVG =====
function buildPullupSVG(pullPct, cueText, phaseName) {
  const cx = 150;
  const barY = 50;
  const bodyTopY = barY + 20 + (1 - pullPct) * 80;
  const bodyBotY = bodyTopY + 70;
  const legEnd = bodyBotY + 60;
  const latActive = pullPct > 0.2;
  const bicepActive = pullPct > 0.4;

  return svgWrap(`
    ${phaseLabel(phaseName, pullPct < 0.1 ? 0 : pullPct < 0.4 ? 1 : pullPct < 0.8 ? 2 : 3)}

    <rect x="60" y="${barY-8}" width="180" height="10" rx="5" fill="#444441"/>

    ${latActive ? `<path d="M${cx-18},${bodyTopY+20} Q${cx-35},${(bodyTopY+bodyBotY)/2} ${cx-15},${bodyBotY}"
      fill="rgba(29,158,117,0.25)" stroke="rgba(29,158,117,0.6)" stroke-width="1">
      <animate attributeName="opacity" values="0.6;1;0.6" dur="0.9s" repeatCount="indefinite"/>
    </path>
    <path d="M${cx+18},${bodyTopY+20} Q${cx+35},${(bodyTopY+bodyBotY)/2} ${cx+15},${bodyBotY}"
      fill="rgba(29,158,117,0.25)" stroke="rgba(29,158,117,0.6)" stroke-width="1"/>` : ''}

    ${limb(cx-50, barY+2, cx-18, bodyTopY+10, 2.5, '#f0f0f2')}
    ${limb(cx+50, barY+2, cx+18, bodyTopY+10, 2.5, '#f0f0f2')}
    ${head(cx, bodyTopY-14)}
    ${limb(cx, bodyTopY, cx, bodyBotY)}
    ${limb(cx, bodyBotY, cx-12, legEnd-20)}
    ${limb(cx, bodyBotY, cx+12, legEnd-20)}
    ${limb(cx-12, legEnd-20, cx-10, legEnd)}
    ${limb(cx+12, legEnd-20, cx+10, legEnd)}
    ${joint(cx-50, barY+2, 5, '#888780')}
    ${joint(cx+50, barY+2, 5, '#888780')}

    ${bicepActive ? muscleDot(cx-34, bodyTopY+30, true, '#378ADD', 5) : ''}
    ${latActive ? muscleDot(cx-25, (bodyTopY+bodyBotY)/2, true, '#1D9E75', 5) : ''}

    ${cueBox(cueText, 298)}
  `);
}

// ===== OHP SVG =====
function buildOHPressSVG(barH, headShift, cueText, phaseName) {
  const cx = 150;
  const floorY = 260;
  const shoulderY = floorY - 120;
  const headBaseY = shoulderY - 35;
  const barBaseY = shoulderY - 10;
  const barActualY = barBaseY - barH * 100;
  const headY = headBaseY + headShift * 0.5;
  const headX = cx - headShift;
  const deltActive = barH > 0.1;

  return svgWrap(`
    ${phaseLabel(phaseName, barH < 0.05 ? 0 : barH < 0.5 ? 1 : barH >= 0.95 ? 2 : 3)}

    <line x1="50" y1="${floorY}" x2="250" y2="${floorY}" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>

    ${deltActive ? `<ellipse cx="${cx-20}" cy="${shoulderY+5}" rx="14" ry="14" fill="rgba(232,160,32,0.25)" stroke="rgba(232,160,32,0.6)" stroke-width="1">
      <animate attributeName="opacity" values="0.6;1;0.6" dur="0.8s" repeatCount="indefinite"/>
    </ellipse>
    <ellipse cx="${cx+20}" cy="${shoulderY+5}" rx="14" ry="14" fill="rgba(232,160,32,0.25)" stroke="rgba(232,160,32,0.6)" stroke-width="1"/>` : ''}

    ${bar(cx-65, barActualY, cx+65, barActualY)}
    ${head(headX, headY)}
    ${limb(cx, headY+14, cx, shoulderY)}
    ${limb(cx, shoulderY, cx, floorY - 60)}
    ${limb(cx, floorY-60, cx-15, floorY)}
    ${limb(cx, floorY-60, cx+15, floorY)}
    ${limb(cx, shoulderY, cx-40, barActualY+6)}
    ${limb(cx, shoulderY, cx+40, barActualY+6)}
    ${joint(cx-40, barActualY+6, 4, '#1D9E75')}
    ${joint(cx+40, barActualY+6, 4, '#1D9E75')}

    ${cueBox(cueText, 298)}
  `);
}

// ===== HIP THRUST SVG =====
function buildHipThrustSVG(hipPct, cueText, phaseName) {
  const cx = 150;
  const floorY = 255;
  const benchX = 80;
  const benchY = 175;
  const hipLow = 220, hipHigh = 175;
  const hipY = hipLow - hipPct * (hipLow - hipHigh);
  const kneeY = hipY + 30;
  const ankleY = floorY;
  const shoulderY = benchY - 5;
  const gluteActive = hipPct > 0.3;

  return svgWrap(`
    ${phaseLabel(phaseName, hipPct < 0.1 ? 0 : hipPct < 0.5 ? 1 : hipPct >= 0.9 ? 2 : 3)}

    <line x1="40" y1="${floorY}" x2="260" y2="${floorY}" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
    <rect x="${benchX}" y="${benchY}" width="80" height="16" rx="4" fill="#1a1a1e" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>

    ${gluteActive ? `<ellipse cx="${cx}" cy="${hipY}" rx="20" ry="13" fill="rgba(29,158,117,0.3)" stroke="rgba(29,158,117,0.7)" stroke-width="1.5">
      <animate attributeName="opacity" values="0.7;1;0.7" dur="0.7s" repeatCount="indefinite"/>
    </ellipse>` : ''}

    ${bar(cx-55, hipY-4, cx+55, hipY-4)}
    ${head(benchX+40, shoulderY - 20)}
    <rect x="${benchX+20}" y="${shoulderY-15}" width="40" height="38" rx="5" fill="none" stroke="#f0f0f2" stroke-width="2"/>
    ${limb(cx-5, shoulderY+20, cx-5, hipY)}
    ${limb(cx-5, hipY, cx-20, kneeY)}
    ${limb(cx-20, kneeY, cx-20, ankleY)}
    ${limb(cx-5, hipY, cx+15, kneeY)}
    ${limb(cx+15, kneeY, cx+15, ankleY)}
    ${limb(cx-20, ankleY, cx-35, ankleY+5)}
    ${limb(cx+15, ankleY, cx+30, ankleY+5)}
    ${joint(cx-20, ankleY, 5, '#888780')}
    ${joint(cx+15, ankleY, 5, '#888780')}

    ${cueBox(cueText, 298)}
  `);
}

// ===== NORDIC CURL SVG =====
function buildNordicSVG(fallAngle, cueText, phaseName) {
  const cx = 120;
  const kneeY = 220;
  const floorY = 250;
  const rad = (fallAngle * Math.PI) / 180;
  const bodyLen = 90;
  const hipX = cx + Math.sin(rad) * bodyLen;
  const hipY = kneeY - Math.cos(rad) * bodyLen;
  const headX = hipX + Math.sin(rad) * 30;
  const headY = hipY - Math.cos(rad) * 30;
  const hamActive = fallAngle > 10;

  return svgWrap(`
    ${phaseLabel(phaseName, fallAngle < 5 ? 0 : fallAngle < 70 ? 1 : fallAngle >= 82 ? 2 : 3)}

    <line x1="40" y1="${floorY}" x2="260" y2="${floorY}" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
    <rect x="60" y="${floorY-12}" width="45" height="12" rx="3" fill="#1a1a1e" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>

    ${hamActive ? `<ellipse cx="${(cx+hipX)/2}" cy="${(kneeY+hipY)/2}" rx="12" ry="${bodyLen*0.35}" transform="rotate(${fallAngle} ${(cx+hipX)/2} ${(kneeY+hipY)/2})" fill="rgba(29,158,117,0.3)" stroke="rgba(29,158,117,0.7)" stroke-width="1.5">
      <animate attributeName="opacity" values="0.6;1;0.6" dur="0.8s" repeatCount="indefinite"/>
    </ellipse>` : ''}

    ${limb(cx, kneeY, cx-20, kneeY+10)}
    ${limb(cx, kneeY, cx+20, kneeY+10)}
    ${limb(cx, kneeY, hipX, hipY)}
    ${limb(hipX, hipY, headX, headY)}
    ${head(headX, headY-14)}
    ${joint(cx, kneeY, 6, '#888780')}

    ${fallAngle > 70 ? `${limb(headX-15, headY+5, headX-15, floorY)} ${limb(headX+10, headY+5, headX+10, floorY)}` : ''}

    ${cueBox(cueText, 298)}
  `);
}

// ===== FACE PULL SVG =====
function buildFacePullSVG(pullPct, cueText, phaseName) {
  const cx = 150;
  const bodyY = 140;
  const elbowSpread = 30 + pullPct * 40;
  const handX = pullPct > 0.5 ? cx + (pullPct-0.5)*20 - 10 : cx + 60 - pullPct * 60;
  const rearDeltActive = pullPct > 0.3;

  return svgWrap(`
    ${phaseLabel(phaseName, pullPct < 0.1 ? 0 : pullPct < 0.5 ? 1 : pullPct >= 0.9 ? 2 : 3)}

    <line x1="270" y1="60" x2="270" y2="280" stroke="rgba(255,255,255,0.08)" stroke-width="2"/>
    <circle cx="270" cy="${bodyY}" r="8" fill="#333"/>
    <line x1="270" y1="${bodyY}" x2="${cx+80}" y2="${bodyY}" stroke="rgba(138,138,146,0.4)" stroke-width="1.5" stroke-dasharray="4,3"/>

    ${rearDeltActive ? `<ellipse cx="${cx-5}" cy="${bodyY-20}" rx="18" ry="10" fill="rgba(29,158,117,0.25)" stroke="rgba(29,158,117,0.6)" stroke-width="1">
      <animate attributeName="opacity" values="0.6;1;0.6" dur="0.9s" repeatCount="indefinite"/>
    </ellipse>` : ''}

    ${head(cx, bodyY - 60)}
    ${limb(cx, bodyY-46, cx, bodyY+40)}
    ${limb(cx, bodyY-20, cx-50, bodyY - elbowSpread*0.5)}
    ${limb(cx-50, bodyY - elbowSpread*0.5, cx-50 + (cx+80-handX)*pullPct, bodyY)}
    ${limb(cx, bodyY-20, cx+50, bodyY - elbowSpread*0.5)}
    ${limb(cx+50, bodyY - elbowSpread*0.5, cx+80 - pullPct*(cx+80-cx-20), bodyY)}
    ${limb(cx, bodyY+40, cx-15, bodyY+100)}
    ${limb(cx, bodyY+40, cx+15, bodyY+100)}

    ${cueBox(cueText, 298)}
  `);
}

// ===== ANIMATION CONTROLLER =====
const AnimController = {
  active: {},

  start(exId, container) {
    this.stop(exId);
    const anim = ExerciseAnimations[exId];
    if (!anim) return;
    let progress = 0;
    let lastTime = null;
    const CYCLE_MS = 4000;

    const tick = (ts) => {
      if (!lastTime) lastTime = ts;
      const dt = ts - lastTime; lastTime = ts;
      progress = (progress + dt / CYCLE_MS) % 1;
      try { anim.render(container, progress); } catch(e) {}
      this.active[exId] = requestAnimationFrame(tick);
    };
    this.active[exId] = requestAnimationFrame(tick);
  },

  stop(exId) {
    if (this.active[exId]) { cancelAnimationFrame(this.active[exId]); delete this.active[exId]; }
  },

  stopAll() {
    Object.keys(this.active).forEach(id => this.stop(id));
  }
};
