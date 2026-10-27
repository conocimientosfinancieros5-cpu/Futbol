# De a una cuerda

Web estática para aprender guitarra criolla desde cero, en español rioplatense. Abrí `index.html` en un navegador moderno. No requiere instalación, build, dependencias ni conexión a Internet.

- Siete lecciones, diagramas SVG accesibles, referencias de afinación y metrónomo de 40 a 160 BPM con Web Audio. El audio se activa al tocar un botón y se detiene al ocultar la página. No usa micrófono: los tonos son referencias, no un afinador automático.
- Marcá **Completada** para guardar el avance en localStorage; volvé a tocar para desmarcar. Lectura y escritura usan try/catch; si el almacenamiento falla, el curso sigue funcionando en memoria. El guardado depende del navegador y del origen; en `file://` puede variar. Para un origen estable, serví esta carpeta con cualquier servidor estático.
- `selfCheck()` en `app.js` verifica por notas las seis tríadas, las frecuencias de afinación y la cantidad de lecciones. Se ejecuta al cargar y se puede repetir desde la consola.

## Referencias de contenido

Posiciones abiertas (sexta a primera): Em `022000`, Am `x02210`, D `xx0232`, C `x32010`, G `320003`, E `022100`. Contrastadas con [Easy Chording](https://www.easychording.com/learn/beginner-guitar-chords/); la autocomprobación verifica además las notas de cada acorde. `x` significa no tocar y `0`, cuerda al aire.

La lección de zamba propone una base introductoria simplificada, no todas las variantes tradicionales. Contexto sobre la relación entre 6/8 y 3/4: [estudio de géneros argentinos en guitarra, Universidad Distrital](https://repository.udistrital.edu.co/bitstreams/93dc736a-5ea1-4a81-935e-05710525a03f/download).

## Sala de ensayo (`extras.js`)
Tocá con la app (acordes al ritmo del metrónomo), juego "¿Qué acorde es?", rutina del día con temporizador, racha y logros, biblioteca de acordes. Guarda en `localStorage` con la clave `de-a-una-cuerda:extras:v1`.
