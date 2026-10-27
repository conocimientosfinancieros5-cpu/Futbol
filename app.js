'use strict';

// Las posiciones van de la sexta cuerda (Mi grave) a la primera (Mi agudo).
const chords = {
  Em: { name: 'Mi menor', frets: [0,2,2,0,0,0], fingers: [0,2,3,0,0,0], notes: [4,7,11] },
  Am: { name: 'La menor', frets: [-1,0,2,2,1,0], fingers: [0,0,2,3,1,0], notes: [9,0,4] },
  D: { name: 'Re mayor', frets: [-1,-1,0,2,3,2], fingers: [0,0,0,1,3,2], notes: [2,6,9] },
  C: { name: 'Do mayor', frets: [-1,3,2,0,1,0], fingers: [0,3,2,0,1,0], notes: [0,4,7] },
  G: { name: 'Sol mayor', frets: [3,2,0,0,0,3], fingers: [2,1,0,0,0,3], notes: [7,11,2] },
  E: { name: 'Mi mayor', frets: [0,2,2,1,0,0], fingers: [0,2,3,1,0,0], notes: [4,8,11] }
};
const tuning = [
  { note: 'E', name: 'Mi', hz: 82.4069 }, { note: 'A', name: 'La', hz: 110 },
  { note: 'D', name: 'Re', hz: 146.8324 }, { note: 'G', name: 'Sol', hz: 195.9977 },
  { note: 'B', name: 'Si', hz: 246.9417 }, { note: 'E', name: 'Mi', hz: 329.6276 }
];

function chordDiagram(key) {
  const chord = chords[key];
  const labels = ['6ª E','5ª A','4ª D','3ª G','2ª B','1ª E'];
  const description = chord.frets.map((fret,i) => `${labels[i]}: ${fret < 0 ? 'no tocar' : fret === 0 ? 'al aire' : `traste ${fret}, dedo ${chord.fingers[i]}`}`).join('; ');
  let drawing = '';
  for (let fret = 0; fret <= 4; fret++) drawing += `<line x1="27" y1="40" x2="127" y2="40" transform="translate(0 ${fret*27})" stroke="${fret === 0 ? '#263d33' : '#abb3a4'}" stroke-width="${fret === 0 ? 5 : 1}"/>`;
  chord.frets.forEach((fret,i) => {
    const x = 27+i*20;
    drawing += `<line x1="${x}" y1="40" x2="${x}" y2="148" stroke="#7a897a"/><text x="${x}" y="167" text-anchor="middle" font-size="9" fill="#667168">${6-i}</text>`;
    if (fret <= 0) drawing += `<text x="${x}" y="28" text-anchor="middle" font-size="15" fill="#263d33">${fret < 0 ? '×' : '○'}</text>`;
    else drawing += `<circle cx="${x}" cy="${40+(fret-.5)*27}" r="9" fill="#234c3e"/><text x="${x}" y="${44+(fret-.5)*27}" text-anchor="middle" font-size="11" fill="white">${chord.fingers[i]}</text>`;
  });
  return `<figure class="chord"><figcaption>${chord.name} · ${key}</figcaption><svg viewBox="0 0 154 180" role="img" aria-label="${chord.name}: ${description}">${drawing}</svg><small>${chord.frets.map(f => f < 0 ? 'x' : f).join('')}</small></figure>`;
}
const chordGroup = keys => `<p class="legend">Mirá el diapasón de frente: 6ª (grave) a la izquierda, 1ª (aguda) a la derecha. Arriba está la cejuela. ○ = al aire; × = no tocar. Números dentro de los puntos: 1 índice, 2 medio, 3 anular, 4 meñique.</p><div class="chords">${keys.map(chordDiagram).join('')}</div>`;
const lessons = [
  { title: 'Conocé tu guitarra', meta: 'PARTES Y POSTURA · 5 MIN', intro: 'Antes de tocar, buscá una posición cómoda. La guitarra criolla tiene cuerdas de nailon: las tres graves llevan un entorchado metálico.', steps: ['Ubicá la caja (cuerpo), la boca, el puente, el mástil, los trastes, la cejuela y las clavijas. El puente sujeta las cuerdas en la caja; las clavijas cambian su tensión.', 'Sentate en una silla firme, con los pies apoyados. Si tocás como diestro, apoyá la caja en el muslo derecho; también podés usar la postura clásica, sobre el izquierdo elevado con un apoyo estable. Si sos zurdo, invertí la postura.', 'Dejá los hombros sueltos, el mástil un poco elevado y el pulgar detrás del mástil. No aprietes de más ni quiebres la muñeca. Si duele, pará y acomodate.'], exercise: 'Ubicá cada parte sin mirar la lista. Después tocá cada cuerda al aire con el pulgar, de la más gruesa a la más finita.' },
  { title: 'Afiná y escuchá', meta: 'AFINACIÓN ESTÁNDAR · 8 MIN', intro: 'De la cuerda más gruesa (6ª) a la más finita (1ª): E A D G B E, o Mi La Re Sol Si Mi. Tocá una referencia y comparala con tu cuerda al aire. Estos tonos no escuchan tu guitarra ni detectan la afinación.', steps: ['Bajá el volumen del dispositivo y elegí una cuerda. Cada referencia suena durante dos segundos; podés repetirla.', 'Tocá esa cuerda al aire y escuchá si está más grave o más aguda que la referencia. Girá la clavija correspondiente de a poquito: más tensión sube la nota, menos tensión la baja. No fuerces la cuerda.', 'Si todavía te cuesta comparar de oído, usá un afinador cromático en modo guitarra. Revisá las seis cuerdas otra vez al terminar.'], extra: `<div class="tones">${tuning.map((t,i) => `<button class="tone" data-tone="${i}" aria-label="Escuchar ${6-i}ª cuerda, ${t.name}, ${t.hz.toFixed(2)} hercios"><span>${6-i}ª cuerda · ${t.name}</span><strong>▶ ${t.note}</strong><span>${t.hz.toFixed(2)} Hz</span></button>`).join('')}</div>`, exercise: 'Afiná las seis cuerdas despacio. Después nombrá sus notas mientras las tocás, de la sexta a la primera.' },
  { title: 'Tus primeros tres acordes', meta: 'MI MENOR · LA MENOR · RE MAYOR · 12 MIN', intro: 'Un acorde reúne varias notas. Apoyá las puntas de los dedos cerca del traste metálico, del lado de la cejuela, sin quedar encima del metal.', steps: ['Armá Mi menor (Em). Tocá las seis cuerdas una por una: todas deberían sonar claras.', 'Armá La menor (Am) y tocá desde la quinta cuerda. Para Re mayor (D), empezá desde la cuarta: evitá las cuerdas marcadas con ×.', 'Si una cuerda se apaga, arqueá un poquito el dedo que la roza. Aflojá la mano entre intentos.'], extra: chordGroup(['Em','Am','D']), exercise: 'Armá cada acorde cinco veces. En cada intento, tocá las cuerdas por separado y después hacé un rasguido suave.' },
  { title: 'Dale movimiento a la mano', meta: 'RASGUIDO ABAJO Y ARRIBA · 8 MIN', intro: 'Abajo (↓) va de las cuerdas graves hacia las agudas; arriba (↑), de las agudas hacia las graves. La muñeca queda suelta y el movimiento es chiquito.', steps: ['Armá Em. Contá en voz alta «1 y 2 y 3 y 4 y», repartiendo las ocho sílabas a la misma distancia.', 'Tocá hacia abajo en cada número y hacia arriba en cada «y». En la subida alcanza con rozar las cuerdas agudas.', 'Repetí sin acelerar. Después probá Am y D, respetando su primera cuerda permitida.'], extra: `<div class="pattern" aria-label="Patrón: 1 abajo, y arriba, 2 abajo, y arriba, 3 abajo, y arriba, 4 abajo, y arriba">${['1','y','2','y','3','y','4','y'].map((n,i)=>`<span>${n}<b>${i%2?'↑':'↓'}</b><small>${i%2?'arriba':'abajo'}</small></span>`).join('')}</div>`, exercise: 'Hacé ocho vueltas del patrón con Em. Buscá un volumen parejo; por ahora, la velocidad no importa.' },
  { title: 'Cambiá sin perder el pulso', meta: 'CAMBIOS DE ACORDE · 10 MIN', intro: 'El metrónomo marca un pulso parejo. Cada clic equivale a una negra; el primer clic de cada grupo de cuatro suena más agudo. Empezá en 60 BPM.', steps: ['Activá el metrónomo y contá «1, 2, 3, 4». Tocá un rasguido hacia abajo con cada clic.', 'Tocá cuatro pulsos de Em y cuatro de Am. Prepará el cambio al final del cuarto pulso. Si cuesta, practicá más lento.', 'Sumá D: cuatro pulsos de Em, cuatro de Am y cuatro de D. Subí 5 BPM recién cuando puedas dar varias vueltas con comodidad.'], extra: '<div class="metro"><label for="bpm">Velocidad <span><output id="bpm-value" for="bpm">60</output> BPM</span></label><input id="bpm" type="range" min="40" max="160" step="1" value="60"><div class="beats" aria-hidden="true"><span class="beat"></span><span class="beat"></span><span class="beat"></span><span class="beat"></span></div><button id="metro-toggle" aria-pressed="false">Iniciar metrónomo</button></div>', exercise: 'Sostené un minuto de cambios Em–Am a 60 BPM, o más lento si lo necesitás. Si perdés el pulso, dejá pasar una vuelta y volvé a entrar en el 1.' },
  { title: 'Abrí el juego con más acordes', meta: 'DO · SOL · MI MAYOR · 12 MIN', intro: 'Con Do (C), Sol (G) y Mi mayor (E) ampliás tu paleta. Mi mayor se parece a Mi menor: se suma el índice en el primer traste de la tercera cuerda.', steps: ['Armá C y rasgueá desde la quinta cuerda. La sexta no se toca.', 'Armá G con medio en sexta/traste 3, índice en quinta/traste 2 y anular en primera/traste 3. Suenan las seis cuerdas.', 'Armá E y tocá las seis cuerdas. Alterná E y Em para escuchar cómo cambia el carácter del acorde.'], extra: chordGroup(['C','G','E']), exercise: 'Tocá C–G–D–Em con cuatro rasguidos abajo por acorde, bien lento. Después alterná Am–E, cuatro pulsos cada uno.' },
  { title: 'Un primer aire de zamba', meta: 'RITMO DE ZAMBA BÁSICO · 12 MIN', intro: 'La zamba argentina juega con la sensación de 6/8 y 3/4. Arrancá con esta base simplificada en seis corcheas: no agota las variantes del rasguido tradicional.', steps: ['Contá «1 2 3 · 4 5 6» en dos grupos de tres, marcando con la voz el 1 y el 4. Primero hacelo sin guitarra.', 'Con Am, tocá un bajo en la quinta cuerda en 1, bajá sobre las cuerdas agudas en 3 y 4, y subí suavemente en 6. En 2 y 5 no ataques las cuerdas: dejá resonar.', 'Repetí despacio y con balanceo, sin convertirlo en una marcha. Alterná dos compases de Am y dos de E; en E usá la sexta cuerda para el bajo.'], extra: `<div class="pattern zamba" aria-label="Seis corcheas: 1 bajo, 2 sin ataque, 3 abajo, 4 abajo acentuado, 5 sin ataque, 6 arriba">${['bajo','resuena','abajo','abajo','resuena','arriba'].map((n,i)=>`<span class="${i===0||i===3?'accent':''}">${i+1}<b>${['●','—','↓','↓','—','↑'][i]}</b><small>${n}</small></span>`).join('')}</div><p class="legend">Practicalo primero sin metrónomo. Si usás el de la lección 5 como guía de corcheas, cada clic será una de estas seis posiciones: ignorá su acento cada cuatro clics.</p>`, exercise: 'Hacé cuatro vueltas de Am–E sin cortar el movimiento. Después escuchá una zamba e intentá reconocer ese balanceo, aunque el acompañamiento tenga más adornos.' }
];

const storageKey = 'de-a-una-cuerda:progreso:v1';
let completed = new Set();
try {
  const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
  if (Array.isArray(saved)) completed = new Set(saved.filter(n => Number.isInteger(n) && n >= 1 && n <= lessons.length));
} catch { document.querySelector('#storage-status').textContent = 'No pudimos leer tu progreso guardado. Podés seguir aprendiendo igual.'; }

document.querySelector('#lesson-nav').innerHTML = lessons.map((lesson,i)=>`<li id="nav-${i+1}"><a href="#leccion-${i+1}" data-lesson="${i+1}"><span class="nav-number">${String(i+1).padStart(2,'0')}</span>${lesson.title}</a></li>`).join('');
document.querySelector('#lesson-list').innerHTML = lessons.map((lesson,i)=>`<details class="lesson" id="leccion-${i+1}" ${i===0?'open':''}><summary><span class="lesson-number">${String(i+1).padStart(2,'0')}</span><div><span class="lesson-meta">${lesson.meta}</span><h2>${lesson.title}</h2></div></summary><div class="lesson-body"><p>${lesson.intro}</p><h3>Paso a paso</h3><ol>${lesson.steps.map(step=>`<li>${step}</li>`).join('')}</ol>${lesson.extra || ''}<div class="exercise"><strong>A PRACTICAR</strong>${lesson.exercise}</div><button class="complete" data-complete="${i+1}" aria-pressed="false">Completada</button></div></details>`).join('');

function updateProgress() {
  document.querySelector('#progress').value = completed.size;
  document.querySelector('#progress-text').textContent = `${completed.size} de 7 lecciones completadas${completed.size === 7 ? ' · ¡Bien ahí!' : ''}`;
  document.querySelector('#progress-percent').textContent = `${Math.round(completed.size/lessons.length*100)}%`;
  document.querySelectorAll('[data-complete]').forEach(button=>{
    const done = completed.has(Number(button.dataset.complete));
    button.setAttribute('aria-pressed',String(done));
    button.textContent = done ? '✓ Completada' : 'Completada';
    document.querySelector(`#nav-${button.dataset.complete}`).classList.toggle('done',done);
  });
}
updateProgress();
document.querySelectorAll('[data-complete]').forEach(button=>button.addEventListener('click',()=>{
  const id = Number(button.dataset.complete);
  if (completed.has(id)) completed.delete(id); else completed.add(id);
  updateProgress();
  try { localStorage.setItem(storageKey,JSON.stringify([...completed])); }
  catch { document.querySelector('#storage-status').textContent = 'El navegador no permite guardar el progreso. Se mantiene mientras esta página siga abierta.'; }
}));
document.querySelectorAll('[data-lesson]').forEach(link=>link.addEventListener('click',()=>{
  document.querySelector(`#leccion-${link.dataset.lesson}`).open = true;
}));
function openHash() {
  if (/^#leccion-[1-7]$/.test(location.hash)) document.querySelector(location.hash).open = true;
}
window.addEventListener('hashchange',openHash);
openHash();

let audio;
let reference;
let timer;
let running = false;
let starting = false;
let nextBeat = 0;
let beat = 0;
let animation;
let visualBeats = [];
let clicks = new Set();
const audioStatus = document.querySelector('#audio-status');
const metroButton = document.querySelector('#metro-toggle');
const bpm = document.querySelector('#bpm');

async function getAudio() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) throw new Error('Tu navegador no admite Web Audio. Probá con un navegador actualizado.');
  if (!audio) audio = new AudioContext();
  await audio.resume();
  if (audio.state !== 'running') throw new Error('No se pudo activar el audio. Volvé a tocar el botón.');
  return audio;
}
function tone(frequency,time,duration,volume,type='sine') {
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0,time);
  gain.gain.linearRampToValueAtTime(volume,time+.008);
  gain.gain.exponentialRampToValueAtTime(.0001,time+duration);
  oscillator.connect(gain);
  gain.connect(audio.destination);
  oscillator.onended = ()=>{ oscillator.disconnect(); gain.disconnect(); clicks.delete(oscillator); };
  oscillator.start(time);
  oscillator.stop(time+duration+.02);
  return oscillator;
}
document.querySelectorAll('[data-tone]').forEach(button=>button.addEventListener('click',async()=>{
  try {
    await getAudio();
    stopMetro();
    if (reference) { reference.stop(); reference = null; }
    const item = tuning[Number(button.dataset.tone)];
    reference = tone(item.hz,audio.currentTime,2,.24,'triangle');
    const current = reference;
    current.addEventListener('ended',()=>{ if (reference===current) reference=null; });
    audioStatus.textContent = `Sonando: ${6-Number(button.dataset.tone)}ª cuerda, ${item.name} (${item.hz.toFixed(2)} Hz).`;
  } catch (error) { audioStatus.textContent = error.message; }
}));
function schedule() {
  while (nextBeat < audio.currentTime+.12) {
    clicks.add(tone(beat===0?1000:700,nextBeat,.045,.16));
    visualBeats.push({time:nextBeat,beat});
    nextBeat += 60/Number(bpm.value);
    beat = (beat+1)%4;
  }
}
function drawBeat() {
  while (visualBeats.length && visualBeats[0].time <= audio.currentTime) {
    const current = visualBeats.shift().beat;
    document.querySelectorAll('.beat').forEach((dot,i)=>dot.classList.toggle('active',i===current));
  }
  if (running) animation = requestAnimationFrame(drawBeat);
}
function stopMetro() {
  running = false;
  clearInterval(timer);
  cancelAnimationFrame(animation);
  clicks.forEach(click=>click.stop());
  clicks.clear();
  visualBeats = [];
  document.querySelectorAll('.beat').forEach(dot=>dot.classList.remove('active'));
  metroButton.textContent = 'Iniciar metrónomo';
  metroButton.setAttribute('aria-pressed','false');
}
metroButton.addEventListener('click',async()=>{
  if (running) { stopMetro(); audioStatus.textContent='Metrónomo detenido.'; return; }
  if (starting) return;
  starting = true;
  try {
    await getAudio();
    if (document.hidden) return;
    if (reference) { reference.stop(); reference=null; }
    running = true;
    beat = 0;
    nextBeat = audio.currentTime+.05;
    schedule();
    timer = setInterval(schedule,25);
    drawBeat();
    metroButton.textContent = 'Detener metrónomo';
    metroButton.setAttribute('aria-pressed','true');
    audioStatus.textContent = 'Metrónomo activo. El primer pulso de cada cuatro suena más agudo.';
  } catch (error) { stopMetro(); audioStatus.textContent=error.message; }
  finally { starting=false; }
});
bpm.addEventListener('input',()=>{
  const value = Math.max(40,Math.min(160,Number(bpm.value)||60));
  bpm.value = value;
  document.querySelector('#bpm-value').value = value;
});
function silence() {
  stopMetro();
  if (reference) { reference.stop(); reference=null; }
  audioStatus.textContent = '';
}
document.addEventListener('visibilitychange',()=>{ if (document.hidden) silence(); });
window.addEventListener('pagehide',silence);

// Autocomprobación: cada diagrama debe formar exactamente la tríada indicada.
function selfCheck() {
  const openNotes = [40,45,50,55,59,64];
  for (const [key,chord] of Object.entries(chords)) {
    const notes = new Set(chord.frets.flatMap((fret,i)=>fret < 0 ? [] : [(openNotes[i]+fret)%12]));
    if (notes.size !== 3 || !chord.notes.every(note=>notes.has(note))) throw new Error(`Diagrama incorrecto: ${key}`);
    if (chord.frets.length !== 6 || chord.frets.some((fret,i)=>fret>0 && !(chord.fingers[i]>=1 && chord.fingers[i]<=4))) throw new Error(`Digitación incorrecta: ${key}`);
  }
  if (lessons.length !== 7 || tuning.some((item,i)=>Math.abs(item.hz-440*2**((openNotes[i]-69)/12))>.001)) throw new Error('Revisar lecciones o afinación');
  return '6 acordes y 6 frecuencias verificados; 7 lecciones.';
}
selfCheck();
