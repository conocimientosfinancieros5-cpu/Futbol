'use strict';
const lessons = CURSO.niveles.flatMap(level => level.lecciones);
const lessonIds = new Set(lessons.map(lesson => lesson.id));
const pairs = [['Em','Am'],['G','C'],['C','D'],['D','A'],['Am','Dm'],['C','F'],['Bm','E']];
const storageKey = 'de-a-una-cuerda:curso:v2';
const state = { completed: new Set(), records: {} };
const previews = new Set();
const $ = selector => document.querySelector(selector);
const label = key => CURSO.acordes[key].etiqueta || key;

function readState(raw) {
  const saved = JSON.parse(raw || '{}');
  if (!saved || typeof saved !== 'object' || Array.isArray(saved)) throw new Error('Formato de progreso inválido');
  return {
    completed: new Set(Array.isArray(saved.completed) ? saved.completed.filter(id => lessonIds.has(id)) : []),
    records: Object.fromEntries(pairs.map(pair => pair.join('–')).filter(key => Number.isSafeInteger(saved.records?.[key]) && saved.records[key] >= 0).map(key => [key, saved.records[key]]))
  };
}
function loadState() {
  try { Object.assign(state, readState(localStorage.getItem(storageKey))); }
  catch { $('#storage-status').textContent = 'No pudimos leer el guardado. Podés practicar y completar lecciones en esta sesión.'; }
  try {
    if (localStorage.getItem('de-a-una-cuerda:progreso:v1')) $('#storage-status').textContent += ' Tu progreso del curso anterior sigue guardado; este recorrido tiene objetivos nuevos y empieza por separado.';
  } catch { /* El aviso de lectura anterior ya explica el modo de sesión. */ }
}
function saveState() {
  try { localStorage.setItem(storageKey, JSON.stringify({ completed:[...state.completed], records:state.records })); }
  catch { $('#storage-status').textContent = 'El navegador no permite guardar. El avance y los récords se conservan mientras esta página siga abierta.'; }
}
function unlocked(index) {
  return CURSO.niveles.slice(0,index).every(level => level.lecciones.every(lesson => state.completed.has(lesson.id)));
}
function chordDiagram(key) {
  const chord = CURSO.acordes[key];
  const fretted = chord.trastes.filter(fret => fret > 0);
  const start = Math.max(...fretted) > 4 ? Math.min(...fretted) : 1;
  const description = chord.trastes.map((fret,i) => `${6-i}ª cuerda: ${fret < 0 ? 'no tocar' : fret === 0 ? 'al aire' : `traste ${fret}, dedo ${chord.dedos[i]}`}`).join('; ');
  let svg = `<text x="9" y="59" font-size="10">${start}</text>`;
  for (let fret=0; fret<=4; fret++) svg += `<line x1="27" y1="${40+fret*27}" x2="127" y2="${40+fret*27}" stroke="#7a897a" stroke-width="${fret===0 && start===1 ? 4 : 1}"/>`;
  for (let i=0; i<6; i++) svg += `<line x1="${27+i*20}" y1="40" x2="${27+i*20}" y2="148" stroke="#7a897a"/><text x="${27+i*20}" y="167" text-anchor="middle" font-size="10">${6-i}</text>`;
  if (chord.cejilla) {
    const [fret,from,to] = chord.cejilla;
    svg += `<line x1="${27+from*20}" y1="${40+(fret-start+.5)*27}" x2="${27+to*20}" y2="${40+(fret-start+.5)*27}" stroke="#234c3e" stroke-width="17" stroke-linecap="round"/>`;
  }
  chord.trastes.forEach((fret,i) => {
    const x=27+i*20, y=40+(fret-start+.5)*27;
    svg += fret<=0 ? `<text x="${x}" y="28" text-anchor="middle" font-size="15">${fret<0 ? 'X' : '○'}</text>` : `<circle cx="${x}" cy="${y}" r="9" fill="#234c3e"/><text x="${x}" y="${y+4}" text-anchor="middle" font-size="11" fill="white">${chord.dedos[i]}</text>`;
  });
  return `<figure class="chord"><figcaption>${label(key)}</figcaption><svg viewBox="0 0 154 180" role="img" aria-label="${label(key)}: ${description}"><title>${label(key)}: ${description}</title>${svg}</svg><small>${chord.trastes.map(fret=>fret<0?'x':fret).join(' · ')}</small></figure>`;
}
function chordGroup(keys) {
  if (!keys.length) return '';
  return `<p class="legend">De frente: 6ª grave a la izquierda, 1ª aguda a la derecha. X = no tocar; ○ = al aire. Dedos: 1 índice, 2 medio, 3 anular, 4 meñique. La barra une las cuerdas de una cejilla; el número al costado indica el traste inicial.</p><div class="chords">${keys.map(chordDiagram).join('')}</div>`;
}
const list = items => items.map(item=>`<li>${item}</li>`).join('');
function songCard(song) {
  return `<details class="song"><summary><span class="lesson-meta">HITO MUSICAL · ${song.artista}</span><h3>${song.titulo}</h3></summary><div class="song-body"><p>${song.tonalidad} · ${song.capo} · ${song.compas}</p><p><b>Tempo orientativo de grabación:</b> ${song.bpm} BPM. <b>Arrancá en:</b> ${song.practica} BPM.</p><p>${song.patron}</p><p class="legend">Cada | separa compases. Un acorde solo ocupa el compás completo; cuando hay más, se indica su duración. No se incluyen letras ni melodías.</p><dl>${song.secciones.map(([name,chart])=>`<dt>${name}</dt><dd>${chart}</dd>`).join('')}</dl><p class="exercise">${song.consejo}</p>${chordGroup(song.acordes)}<p><a href="${song.fuente}" target="_blank" rel="noopener noreferrer">Fuente para contrastar el acompañamiento</a></p><button data-tempo="${song.practica}" data-meter="${song.metrica||4}">Preparar metrónomo · ${song.practica} BPM</button><p class="legend">Meta: dos pasadas completas a tempo de práctica sin detenerte. Después subí de a 5 BPM; repetí el nivel si todavía no sale cómodo.</p></div></details>`;
}
function render() {
  $('#lesson-nav').innerHTML = CURSO.niveles.map((level,i)=>`<li id="nav-${level.id}"><a href="#nivel-${level.id}"><span class="nav-number">${i+1}</span><span>${level.nombre}<small class="nav-status"></small></span></a></li>`).join('');
  $('#lesson-list').innerHTML = CURSO.niveles.map((level,i)=>`<section class="level" id="nivel-${level.id}"><p class="eyebrow">NIVEL ${i+1}</p><h2>${level.nombre}</h2><p>${level.lema}</p><p class="level-status" role="status"></p><div class="lock-message"><p>Completá los niveles anteriores para desbloquear este recorrido. También podés explorarlo ahora.</p><button data-preview="${i}" aria-expanded="false" aria-controls="contenido-${level.id}">Ver igual</button></div><div class="level-content" id="contenido-${level.id}">${level.lecciones.map((lesson,j)=>`<details class="lesson" id="leccion-${lesson.id}" ${i===0 && j===0?'open':''}><summary><span class="lesson-number">${j+1}</span><div><span class="lesson-meta">PRÁCTICA · ${lesson.bpm} BPM</span><h3>${lesson.titulo}</h3></div></summary><div class="lesson-body"><h4>Objetivo</h4><p>${lesson.objetivo}</p><p>${lesson.explicacion}</p>${chordGroup(lesson.acordes)}<h4>Paso a paso</h4><ol>${list(lesson.pasos)}</ol>${lesson.patron?`<div class="pattern" aria-label="Patrón folk en ocho corcheas">${lesson.patron.map((stroke,k)=>`<span>${k%2?'y':k/2+1}<b>${stroke}</b></span>`).join('')}</div>`:''}<div class="exercise"><strong>A PRACTICAR · ${lesson.bpm} BPM</strong>${lesson.ejercicio}<p><b>Lo domino cuando:</b> ${lesson.dominio}</p><button data-tempo="${lesson.bpm}" data-meter="${lesson.metrica||4}">Preparar metrónomo</button>${lesson.cambios?'<button data-changes>Abrir minuto de cambios</button>':''}</div><h4>Si no sale, probá esto</h4><ul>${list(lesson.errores)}</ul><button class="complete" data-complete="${lesson.id}" aria-pressed="false">Completada</button></div></details>`).join('')}<div class="milestones"><p class="eyebrow">HACÉ MÚSICA CON LO QUE APRENDISTE</p><h3>Canciones del nivel</h3>${level.canciones.map(songCard).join('')}</div></div></section>`).join('');
  updateProgress();
}
function updateProgress() {
  $('#progress').max=lessons.length; $('#progress').value=state.completed.size;
  $('#progress-text').textContent=`${state.completed.size} de ${lessons.length} lecciones completadas`;
  $('#progress-percent').textContent=`${Math.round(state.completed.size/lessons.length*100)}%`;
  document.querySelectorAll('[data-complete]').forEach(button=>{
    const done=state.completed.has(button.dataset.complete);
    button.setAttribute('aria-pressed',String(done)); button.textContent=done?'✓ Completada':'Completada';
  });
  CURSO.niveles.forEach((level,i)=>{
    const section=$(`#nivel-${level.id}`), open=unlocked(i), preview=previews.has(i);
    const count=level.lecciones.filter(lesson=>state.completed.has(lesson.id)).length;
    section.querySelector('.level-content').hidden=!open && !preview;
    section.querySelector('.lock-message').hidden=open;
    section.querySelector('[data-preview]').textContent=preview?'Ocultar vista previa':'Ver igual';
    section.querySelector('[data-preview]').setAttribute('aria-expanded',String(preview));
    section.querySelector('.level-status').textContent=`${count}/${level.lecciones.length} completadas · ${open?'Disponible':preview?'Vista previa':'Bloqueado'}`;
    const nav=$(`#nav-${level.id}`); nav.classList.toggle('done',count===level.lecciones.length);
    nav.querySelector('.nav-status').textContent=`${count}/${level.lecciones.length} · ${open?'Disponible':'Bloqueado'}`;
  });
}
function openHash() {
  const id=location.hash.slice(1);
  CURSO.niveles.forEach((level,i)=>{
    if (id===`nivel-${level.id}` || level.lecciones.some(lesson=>id===`leccion-${lesson.id}`)) {
      const target=document.getElementById(id);
      if (!unlocked(i) && !previews.has(i)) { document.getElementById(`nivel-${level.id}`).scrollIntoView(); return; }
      if (target.tagName==='DETAILS') target.open=true;
      target.scrollIntoView();
    }
  });
}
let audio, metroTimer, animation, nextBeat=0, beat=0, running=false, starting=false;
let visualBeats=[];
const clicks=new Set();
async function getAudio() {
  const AudioContext=window.AudioContext||window.webkitAudioContext;
  if (!AudioContext) throw new Error('Tu navegador no admite Web Audio. Probá con uno actualizado.');
  if (!audio) audio=new AudioContext();
  await audio.resume();
  if (audio.state!=='running') throw new Error('No se pudo activar el audio. Volvé a tocar el botón.');
}
function clickAt(time,accent) {
  const oscillator=audio.createOscillator(), gain=audio.createGain();
  oscillator.frequency.value=accent?1000:700;
  gain.gain.setValueAtTime(0,time); gain.gain.linearRampToValueAtTime(.16,time+.005); gain.gain.exponentialRampToValueAtTime(.0001,time+.045);
  oscillator.connect(gain); gain.connect(audio.destination);
  oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();clicks.delete(oscillator);};
  clicks.add(oscillator); oscillator.start(time); oscillator.stop(time+.06);
}
function schedule() {
  while (nextBeat<audio.currentTime+.1) {
    clickAt(nextBeat,beat===0); visualBeats.push({time:nextBeat,beat});
    nextBeat+=60/Number($('#bpm').value); beat=(beat+1)%Number($('#meter').value);
  }
}
function drawBeat() {
  while (visualBeats.length && visualBeats[0].time<=audio.currentTime) {
    const current=visualBeats.shift().beat;
    document.querySelectorAll('.beat').forEach((dot,i)=>dot.classList.toggle('active',i===current));
  }
  if (running) animation=requestAnimationFrame(drawBeat);
}
function stopMetro() {
  running=false; clearInterval(metroTimer); cancelAnimationFrame(animation); if (typeof stopPlay==='function') stopPlay('Detenido.');
  clicks.forEach(click=>click.stop()); clicks.clear(); visualBeats=[];
  document.querySelectorAll('.beat').forEach(dot=>dot.classList.remove('active'));
  $('#metro-toggle').textContent='Iniciar metrónomo'; $('#metro-toggle').setAttribute('aria-pressed','false'); $('#tool-state').textContent='· A practicar';
}
function configureMeter() {
  $('#meter').value=String([2,3,4].includes(Number($('#meter').value))?Number($('#meter').value):4);
  $('#tools .beats').innerHTML=Array.from({length:Number($('#meter').value)},()=>'<span class="beat"></span>').join('');
}
let changeTimer, deadline=0, changeCount=0, activePair='';
function remaining(now) { return Math.max(0,Math.ceil((deadline-now)/1000)); }
function updateRecord() { $('#change-record').value=state.records[$('#change-pair').value]||0; }
function finishChanges(cancelled=false) {
  clearInterval(changeTimer); deadline=0;
  if (!cancelled) { state.records[activePair]=Math.max(state.records[activePair]||0,changeCount); saveState(); $('#countdown').value=0; }
  $('#change-status').textContent=cancelled?'Intento interrumpido: no se guardó el resultado. Iniciá otro minuto.':'Minuto terminado. Récord actualizado; contá sólo los cambios que sonaron claros.';
  $('#change-start').textContent='Iniciar minuto'; $('#change-add').disabled=true; $('#change-pair').disabled=false; updateRecord();
}
function tickChanges() { $('#countdown').value=remaining(Date.now()); if (!remaining(Date.now())) finishChanges(); }
function selfCheck() {
  const openNotes=[40,45,50,55,59,64];
  for (const [key,chord] of Object.entries(CURSO.acordes)) {
    if (chord.trastes.length!==6 || chord.dedos.length!==6 || chord.trastes.some((fret,i)=>!Number.isInteger(fret) || fret< -1 || (fret>0 ? chord.dedos[i]<1||chord.dedos[i]>4 : chord.dedos[i]!==0))) throw new Error(`Digitación inválida: ${key}`);
    const notes=new Set(chord.trastes.flatMap((fret,i)=>fret<0?[]:[(openNotes[i]+fret)%12]));
    if (notes.size!==chord.notas.length || !chord.notas.every(note=>notes.has(note))) throw new Error(`Notas incorrectas: ${key}`);
    if (chord.bajo!==undefined && (openNotes[chord.trastes.findIndex(fret=>fret>=0)]+chord.trastes.find(fret=>fret>=0))%12!==chord.bajo) throw new Error(`Bajo incorrecto: ${key}`);
    if (chord.cejilla) {
      const [fret,from,to]=chord.cejilla;
      if (from>=to || chord.trastes.slice(from,to+1).some(value=>value<fret) || chord.trastes[from]!==fret || chord.trastes[to]!==fret) throw new Error(`Cejilla inválida: ${key}`);
    }
    if (!chordDiagram(key).includes('<svg')) throw new Error(`Falta SVG: ${key}`);
  }
  if (CURSO.niveles.length<6 || lessonIds.size!==lessons.length) throw new Error('Revisar niveles o identificadores');
  const known=new Set();
  for (const level of CURSO.niveles) {
    if (level.lecciones.length<2 || !level.canciones.length) throw new Error(`Nivel incompleto: ${level.id}`);
    for (const lesson of level.lecciones) {
      if (!lesson.objetivo || !lesson.explicacion || lesson.pasos.length<3 || !lesson.ejercicio || !lesson.dominio || !lesson.errores.length || !(lesson.bpm>=30 && lesson.bpm<=220)) throw new Error(`Lección incompleta: ${lesson.id}`);
      lesson.acordes.forEach(key=>{if (!CURSO.acordes[key]) throw new Error(`Falta acorde: ${key}`);known.add(key);});
    }
    for (const song of level.canciones) {
      song.acordes.forEach(key=>{if (!known.has(key)) throw new Error(`Acorde no enseñado antes de ${song.titulo}: ${key}`);});
      for (const [,chart] of song.secciones) {
        const tokens=(chart.match(/\b[A-G](?:♯|♭|#|b)?(?:maj7|m7|m|7)?(?:\/[A-G](?:♯|#)?)?(?![a-z#])/g)||[]).map(t=>t.replace(/♯/g,'#').replace(/♭/g,'b'));
        tokens.forEach(token=>{if (!song.acordes.some(key=>[key,label(key)].some(n=>n.replace(/♯/g,'#').replace(/♭/g,'b')===token))) throw new Error(`Acorde sin declarar en ${song.titulo}: ${token}`);});
      }
    }
  }
  pairs.flat().forEach(key=>{if (!CURSO.acordes[key]) throw new Error(`Par sin diagrama: ${key}`);});
  return `${CURSO.niveles.length} niveles, ${lessons.length} lecciones, ${CURSO.niveles.reduce((sum,level)=>sum+level.canciones.length,0)} canciones y ${Object.keys(CURSO.acordes).length} diagramas verificados nota por nota.`;
}
function init() {
  selfCheck(); loadState(); render(); configureMeter();
  $('#change-pair').innerHTML=pairs.map(pair=>`<option>${pair.join('–')}</option>`).join(''); updateRecord();
  document.addEventListener('click',event=>{
    const button=event.target.closest('button'); if (!button) return;
    if (button.dataset.complete) {
      const id=button.dataset.complete; state.completed.has(id)?state.completed.delete(id):state.completed.add(id);
      saveState(); updateProgress();
    }
    if (button.dataset.preview!==undefined) {
      const index=Number(button.dataset.preview); previews.has(index)?previews.delete(index):previews.add(index); updateProgress();
    }
    if (button.dataset.tempo) {
      stopMetro(); $('#bpm').value=button.dataset.tempo; $('#bpm-value').value=button.dataset.tempo;
      $('#meter').value=button.dataset.meter; configureMeter(); $('#tools').open=true; $('#metro-toggle').focus();
      $('#audio-status').textContent='Velocidad preparada. Tocá Iniciar para escuchar.';
    }
    if (button.hasAttribute('data-changes')) { $('#tools').open=true; $('#change-start').focus(); }
  });
  $('#metro-toggle').addEventListener('click',async()=>{
    if (running) {stopMetro();$('#audio-status').textContent='Metrónomo detenido.';return;}
    if (starting) return; starting=true; $('#metro-toggle').disabled=true; if (typeof stopPlay==='function') stopPlay('Detenido: arrancó el metrónomo.');
    try {
      await getAudio(); if (document.hidden) return;
      running=true;beat=0;nextBeat=audio.currentTime+.05;schedule();metroTimer=setInterval(schedule,25);drawBeat();
      $('#metro-toggle').textContent='Detener metrónomo'; $('#metro-toggle').setAttribute('aria-pressed','true');
      $('#audio-status').textContent='Activo. El primer pulso del compás lleva acento.'; $('#tool-state').textContent='· Metrónomo activo';
    } catch (error) {stopMetro();$('#audio-status').textContent=error.message;}
    finally {starting=false;$('#metro-toggle').disabled=false;}
  });
  $('#bpm').addEventListener('input',()=>{ $('#bpm').value=Math.max(30,Math.min(220,Number($('#bpm').value)||60)); $('#bpm-value').value=$('#bpm').value; });
  $('#meter').addEventListener('change',()=>{stopMetro();configureMeter();$('#audio-status').textContent='Compás preparado. Volvé a iniciar el metrónomo.';});
  $('#change-pair').addEventListener('change',updateRecord);
  $('#change-start').addEventListener('click',()=>{
    if (deadline) {finishChanges(true);return;}
    activePair=$('#change-pair').value; changeCount=0; deadline=Date.now()+60000;
    $('#change-count').value=0; $('#countdown').value=60; $('#change-pair').disabled=true;
    $('#change-add').disabled=false;$('#change-start').textContent='Cancelar intento';$('#change-status').textContent='Contá cada llegada limpia al otro acorde.';
    changeTimer=setInterval(tickChanges,100);$('#change-add').focus();
  });
  $('#change-add').addEventListener('click',()=>{
    if (!deadline) return;
    if (!remaining(Date.now())) {finishChanges();return;} $('#change-count').value=++changeCount;
  });
  function silence() {stopMetro(); if (deadline) finishChanges(true);}
  document.addEventListener('visibilitychange',()=>{if(document.hidden) silence();});
  window.addEventListener('pagehide',silence);
  window.addEventListener('hashchange',openHash); if(location.hash) openHash();
}
if (typeof document!=='undefined') init();
