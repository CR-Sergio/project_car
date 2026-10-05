# Videos · Proyect Car

Plan de contenido para la primera semana: 3 videos el día 1 y 2 diarios después, más 3 teasers opcionales y un banco
de reserva. Todos se hacen con **Remotion + Claude Code**, con el mismo arte de la página (papel, cinta, letras
recortadas, pared de block) y el formato del primer video de prueba.

| Archivo | Para qué |
|---|---|
| [`BRIEF_REMOTION.md`](BRIEF_REMOTION.md) | **Pégalo primero en Claude Code.** Contexto, reglas legales de contenido, formato, paleta, fuentes, componentes, reglas de Remotion, cómo grabar tomas y voz |
| [`IDEAS.md`](IDEAS.md) | Calendario + 22 ideas. Cada una trae objetivo, gancho, guion de voz con tiempos, tomas a grabar, escenas, prompt para Claude Code, descripción y comentario fijado |
| `ref/formato-referencia-*.jpg` | Cuadros del video de prueba (un cuadro por segundo). **Solo formato; los números son viejos** |

**Flujo por video:**
1. Graba las tomas de la lista del video, más las "tomas base" del brief, una sola vez.
2. Graba la voz con el guion y guárdala en `public/vo/`.
3. En Claude Code pega el brief y luego el prompt del video.
4. Transcribe la voz con whisper.cpp, que ya está incluido en el brief.
5. Revisa en Remotion Studio (`npx remotion studio`) y ajusta los props.
6. Exporta con `npx remotion render`.
