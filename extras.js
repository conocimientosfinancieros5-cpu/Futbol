'use strict';
// Juegos y herramientas extra. Reutiliza CURSO, state, label, chordDiagram, getAudio, clickAt, stopMetro y unlocked de app.js.
const extrasKey = 'de-a-una-cuerda:extras:v1';
const extras = { days: [], quizBest: 0, songsDone: [] };
const norm = s => s.replace(/♯/g,'#').replace(/♭/g,'b');
const today = () => new Date().toLocaleDateString('sv');

function loadExtras() {
  try {
    const saved = JSON.parse(localStorage.getItem(extrasKey) || '{}');
    if (Array.isArray(saved.days)) extras.days = saved.days.filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d));
    if (Number.isSafeInteger(saved.quizBest)) extras.quizBest = saved.quizBest;
    if (Array.isArray(saved.songsDone)) extras.songsDone = saved.songsDone.filter(id => typeof id === 'string');
  } catch { /* Sin guardado: los juegos funcionan igual en esta sesión. */ }
}
function saveExtras() {
  try { localStorage.setItem(extrasKey, JSON.stringify(extras)); } catch { /* idem */ }
  renderBadges();
}
function practicedToday() {
  if (!extras.days.includes(today())) { extras.days.push(today()); saveExtras(); }
}
function streak() {
  const days = new Set(extras.days), d = new Date();
  if (!days.has(today())) d.setDate(d.getDate() - 1); // la racha sigue viva hasta que termine el día de hoy
  let n = 0;
  while (days.has(d.toLocaleDateString('sv'))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
const allSongs = () => CURSO.niveles.flatMap((level, i) => level.canciones.map(song => ({ song, level: i })));

// ---------- Tocá con la app: los acordes pasan al ritmo del metrónomo ----------
function chordKey(token) {
  return Object.keys(CURSO.acordes).find(key => norm(key) === norm(token) || norm(label(key)) === norm(token));
}
function songBars(song) {
  const bars = [];
  for (const [section, chart] of song.secciones) {
    if (!chart.includes('|')) continue;
    for (const raw of chart.split('|')) {
      const tokens = raw.replace(/\([^)]*\)/g, ' ').trim().split(/\s+/).filter(Boolean);
      const keys = tokens.map(chordKey);
      if (tokens.length && keys.every(Boolean)) bars.push({ section, chords: keys });
    }
  }
  return bars;
}
const playable = () => allSongs().filter(({ song }) => songBars(song).length);
let play = null;

function stopPlay(message) {
  if (!play) return;
  clearInterval(play.timer); cancelAnimationFrame(play.raf); play = null;
  $('#play-toggle').textContent = 'Tocar'; $('#play-toggle').setAttribute('aria-pressed', 'false');
  if (message) $('#play-status').textContent = message;
}
function showPlayChord(event) {
  $('#play-section').textContent = event.countIn ? 'Cuenta de entrada' : `${event.section} · compás ${event.bar + 1} de ${play.bars.length}`;
  $('#play-now').textContent = event.countIn ? event.beat + 1 : label(event.chord);
  $('#play-next').textContent = event.next ? `Sigue: ${label(event.next)}` : '';
  if (!event.countIn && event.chord !== play.shown) { play.shown = event.chord; $('#play-diagram').innerHTML = chordDiagram(event.chord); }
  document.querySelectorAll('#play-beats span').forEach((dot, i) => dot.classList.toggle('active', i === event.beat));
}
function playEvents(bars, beats) {
  const events = Array.from({ length: beats }, (_, beat) => ({ countIn: true, beat }));
  bars.forEach((bar, b) => {
    for (let beat = 0; beat < beats; beat++) {
      const chord = bar.chords[Math.floor(beat * bar.chords.length / beats)];
      events.push({ bar: b, beat, chord, section: bar.section });
    }
  });
  events.forEach((event, i) => { if (!event.countIn) event.next = events.slice(i + 1).find(e => e.chord && e.chord !== event.chord)?.chord; });
  return events;
}
async function startPlay() {
  const { song } = playable()[Number($('#play-song').value)];
  const bars = songBars(song), beats = song.metrica || 4, bpm = Number($('#play-bpm').value);
  try { await getAudio(); } catch (error) { $('#play-status').textContent = error.message; return; }
  stopMetro();
  const events = playEvents(bars, beats);
  play = { bars, events, i: 0, shown: null, queue: [], next: audio.currentTime + .1, step: 60 / bpm, song };
  $('#play-beats').innerHTML = '<span></span>'.repeat(beats);
  const schedule = () => {
    while (play && play.i < events.length && play.next < audio.currentTime + .1) {
      clickAt(play.next, events[play.i].beat === 0);
      play.queue.push({ time: play.next, event: events[play.i] });
      play.next += play.step; play.i++;
    }
  };
  const draw = () => {
    if (!play) return;
    while (play.queue.length && play.queue[0].time <= audio.currentTime) showPlayChord(play.queue.shift().event);
    if (play.i >= events.length && !play.queue.length) return finishPlay();
    play.raf = requestAnimationFrame(draw);
  };
  schedule(); play.timer = setInterval(schedule, 25); draw();
  $('#play-toggle').textContent = 'Detener'; $('#play-toggle').setAttribute('aria-pressed', 'true');
  $('#play-status').textContent = `${song.titulo} a ${bpm} BPM. Cuatro clics de entrada y arrancás.`;
}
function finishPlay() {
  const { song } = play;
  if (!extras.songsDone.includes(song.id)) extras.songsDone.push(song.id);
  practicedToday();
  if ($('#play-loop').checked) { stopPlay(); startPlay(); return; }
  stopPlay(`¡Pasada completa de ${song.titulo}! Si salió limpia, subí 5 BPM y repetí.`);
}
function setupPlay() {
  const songs = playable();
  $('#play-song').innerHTML = songs.map(({ song, level }, i) => `<option value="${i}">${CURSO.niveles[level].nombre} · ${song.titulo}</option>`).join('');
  const preset = () => {
    const { song } = songs[Number($('#play-song').value)];
    $('#play-bpm').value = song.practica; $('#play-bpm-value').value = song.practica;
    $('#play-now').textContent = label(songBars(song)[0].chords[0]); $('#play-next').textContent = ''; $('#play-section').textContent = 'Listo para empezar';
    $('#play-diagram').innerHTML = chordDiagram(songBars(song)[0].chords[0]);
  };
  $('#play-song').addEventListener('change', () => { stopPlay(); preset(); });
  $('#play-bpm').addEventListener('input', () => { $('#play-bpm-value').value = $('#play-bpm').value; });
  $('#play-toggle').addEventListener('click', () => play ? stopPlay('Detenido.') : startPlay());
  preset();
}

// ---------- ¿Qué acorde es? ----------
let quiz = { answer: null, run: 0, total: 0 };
function quizPool() {
  if ($('#quiz-all').checked) return Object.keys(CURSO.acordes);
  const keys = new Set();
  CURSO.niveles.forEach((level, i) => { if (i === 0 || unlocked(i)) level.lecciones.forEach(lesson => lesson.acordes.forEach(k => keys.add(k))); });
  return [...keys];
}
const shuffle = list => list.map(v => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map(([, v]) => v);
function nextQuestion() {
  const pool = quizPool();
  const answer = pool[Math.floor(Math.random() * pool.length)];
  const others = shuffle((pool.length >= 4 ? pool : Object.keys(CURSO.acordes)).filter(k => k !== answer)).slice(0, 3);
  quiz.answer = answer;
  $('#quiz-diagram').innerHTML = chordDiagram(answer)
    .replace(/<figcaption>.*?<\/figcaption>/, '').replace(/<title>.*?<\/title>/, '').replace(/aria-label="[^"]*"/, 'aria-label="Acorde misterioso"');
  $('#quiz-options').innerHTML = shuffle([answer, ...others]).map(k => `<button data-quiz="${k}">${label(k)} · ${CURSO.acordes[k].nombre}</button>`).join('');
}
function answerQuiz(key) {
  const right = key === quiz.answer;
  quiz.run = right ? quiz.run + 1 : 0;
  if (right && ++quiz.total % 10 === 0) practicedToday();
  if (quiz.run > extras.quizBest) { extras.quizBest = quiz.run; saveExtras(); }
  $('#quiz-status').textContent = right ? `¡Bien! Era ${label(quiz.answer)}.` : `Era ${label(quiz.answer)} (${CURSO.acordes[quiz.answer].nombre}). Armalo en la guitarra antes de seguir.`;
  $('#quiz-score').textContent = `Racha: ${quiz.run} · Récord: ${extras.quizBest}`;
  nextQuestion();
}

// ---------- Rutina del día ----------
let routine = null;
function currentPlan() {
  const lesson = lessons.find(l => !state.completed.has(l.id)) || lessons[lessons.length - 1];
  const level = CURSO.niveles.find(lv => lv.lecciones.includes(lesson));
  return { lesson, song: level.canciones[0] };
}
function routineBlocks(minutes) {
  const { lesson, song } = currentPlan();
  const parts = [
    [.15, 'Calentamiento', 'Postura, mano derecha suelta y cada cuerda sonando limpia. Sin apuro.'],
    [.25, 'Cambios de acorde', 'Abrí "Metrónomo y cambios" y hacé el minuto de cambios con un par que te cueste.'],
    [.35, `Lección: ${lesson.titulo}`, `${lesson.ejercicio} <a href="#leccion-${lesson.id}">Ir a la lección</a>`],
    [.25, `Canción: ${song.titulo}`, 'Tocala con "Tocá con la app" a tempo de práctica, de principio a fin.']
  ];
  return parts.map(([share, title, text]) => ({ title, text, seconds: Math.round(share * minutes * 60) }));
}
const mmss = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
function renderRoutine(blocks, active = -1, left = 0) {
  $('#routine-list').innerHTML = blocks.map((b, i) => `<li class="${i === active ? 'active' : i < active ? 'done' : ''}"><b>${b.title}</b> · ${i === active ? mmss(left) : mmss(b.seconds)}<br><span>${b.text}</span></li>`).join('');
}
function routineStep() {
  const left = Math.max(0, Math.ceil((routine.end - Date.now()) / 1000));
  renderRoutine(routine.blocks, routine.i, left);
  if (!left) advanceRoutine();
}
function advanceRoutine() {
  routine.i++;
  if (audio) clickAt(audio.currentTime + .01, true);
  if (routine.i >= routine.blocks.length) {
    clearInterval(routine.timer); routine = null; practicedToday();
    $('#routine-start').textContent = 'Empezar rutina'; $('#routine-skip').disabled = true;
    $('#routine-status').textContent = '¡Rutina terminada! Un día más en tu racha.';
    return;
  }
  routine.end = Date.now() + routine.blocks[routine.i].seconds * 1000; routineStep();
}
function setupRoutine() {
  const preview = () => renderRoutine(routineBlocks(Number($('#routine-min').value)));
  $('#routine-min').addEventListener('change', () => { if (!routine) preview(); });
  $('#routine-start').addEventListener('click', async () => {
    if (routine) { clearInterval(routine.timer); routine = null; $('#routine-start').textContent = 'Empezar rutina'; $('#routine-skip').disabled = true; $('#routine-status').textContent = 'Rutina cancelada.'; preview(); return; }
    try { await getAudio(); } catch { /* sin aviso sonoro, el temporizador funciona igual */ }
    routine = { blocks: routineBlocks(Number($('#routine-min').value)), i: -1 };
    routine.timer = setInterval(routineStep, 250); advanceRoutine();
    $('#routine-start').textContent = 'Cancelar'; $('#routine-skip').disabled = false;
    $('#routine-status').textContent = 'Suena un clic al cambiar de bloque.';
  });
  $('#routine-skip').addEventListener('click', () => routine && advanceRoutine());
  preview();
}

// ---------- Racha y logros ----------
function badges() {
  const done = id => state.completed.has(id);
  const levelDone = i => CURSO.niveles[i].lecciones.every(l => done(l.id));
  const beatles = allSongs().filter(({ song }) => song.artista.startsWith('The Beatles') && extras.songsDone.includes(song.id)).length;
  const bestChanges = Math.max(0, ...Object.values(state.records));
  return [
    ['🎸', 'Primer paso', 'Completá tu primera lección', state.completed.size >= 1],
    ['🔥', 'Tres al hilo', 'Practicá 3 días seguidos', streak() >= 3],
    ['📅', 'Semana entera', 'Practicá 7 días seguidos', streak() >= 7],
    ['⚡', 'Manos rápidas', '30 cambios limpios en un minuto', bestChanges >= 30],
    ['🧠', 'Oído y ojo', '15 acordes seguidos bien en el juego', extras.quizBest >= 15],
    ['🎶', 'Primera canción', 'Tocá una canción entera con la app', extras.songsDone.length >= 1],
    ['🪲', 'Fab Four', 'Tocá 4 canciones de los Beatles enteras', beatles >= 4],
    ['🌱', 'Principiante superado', 'Terminá el nivel 1', levelDone(0)],
    ['💪', 'Cejilla domada', 'Completá las lecciones de cejilla', done('cejilla-f') && done('barras')],
    ['🏆', 'Maestría', 'Terminá los 6 niveles', CURSO.niveles.every((_, i) => levelDone(i))]
  ];
}
function renderBadges() {
  const list = badges(), got = list.filter(b => b[3]).length;
  $('#streak').textContent = streak();
  $('#badge-count').textContent = `${got} de ${list.length} logros`;
  $('#badges').innerHTML = list.map(([icon, name, how, ok]) => `<li class="${ok ? 'got' : ''}"><span aria-hidden="true">${icon}</span><b>${name}</b><small>${ok ? '¡Conseguido!' : how}</small></li>`).join('');
}

// ---------- Biblioteca de acordes ----------
function renderLibrary() {
  const q = $('#library-search').value.trim().toLowerCase();
  const keys = Object.keys(CURSO.acordes).filter(k => !q || k.toLowerCase().includes(q) || CURSO.acordes[k].nombre.toLowerCase().includes(q));
  $('#library').innerHTML = keys.length ? keys.map(chordDiagram).join('') : '<p>No hay acordes con ese nombre.</p>';
}

function initExtras() {
  loadExtras(); setupPlay(); setupRoutine(); renderBadges();
  $('#quiz-all').addEventListener('change', nextQuestion);
  $('#library-search').addEventListener('input', renderLibrary);
  $('#extra-library').addEventListener('toggle', () => { if ($('#extra-library').open && !$('#library').innerHTML) renderLibrary(); });
  $('#extra-quiz').addEventListener('toggle', () => { if ($('#extra-quiz').open && !quiz.answer) nextQuestion(); });
  document.addEventListener('click', event => {
    const button = event.target.closest('button'); if (!button) return;
    if (button.dataset.quiz) answerQuiz(button.dataset.quiz);
    if (button.dataset.complete) { if (state.completed.has(button.dataset.complete)) practicedToday(); renderBadges(); setTimeout(() => { if (!routine) renderRoutine(routineBlocks(Number($('#routine-min').value))); }); }
  });
  $('#extra-badges').addEventListener('toggle', renderBadges);
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopPlay('Pausado al salir de la página.'); });
}
if (typeof document !== 'undefined') initExtras();
