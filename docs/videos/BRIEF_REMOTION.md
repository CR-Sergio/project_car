# Brief maestro para Claude Code + Remotion · Proyect Car

> **Cómo usarlo:** pega este archivo completo al inicio de cada sesión de Claude Code en tu proyecto de Remotion
> (o guárdalo como `CLAUDE.md` en la raíz de ese proyecto). Después pega el prompt del video que quieras de
> [`IDEAS.md`](IDEAS.md). Este brief define el estilo, los componentes y las reglas; cada video solo dice qué
> escenas lleva.

---

## 0. Contexto del proyecto (para el modelo)

Proyect Car: un regio vende su **Fiat Palio 2013 plateado "en pedazos"** como espacio publicitario, estilo Million
Dollar Homepage, para juntar **$150,000 MXN** y comprar un project car. Todo se compra en **proyectcar.com**.

| Qué se vende | Precio | Detalle |
|---|---|---|
| Cofre | $18,000 | marcas |
| Franja del parabrisas | $13,000 | marcas |
| Portón trasero / Medallón | $12,000 c/u | marcas |
| Puertas traseras (con costado) | $10,500 c/u | marcas |
| Puertas delanteras | $9,500 c/u | marcas |
| Defensas delantera y trasera | $8,000 c/u | marcas |
| Ventanas traseras | $7,500 c/u | marcas |
| **Mensaje en las salpicaderas** | **$100** | hasta 24 caracteres, **hasta agotar existencias** |
| **Nombre en el techo** | **gratis** | de regalo con cada mensaje |

- 12 piezas para marcas + 2 salpicaderas de mensajes + techo de nombres.
- El vinil dura **6 meses**. Precios **finales**. **Todas las ventas son finales.**
- Base: junto al **Tec de Monterrey** (Garza Sada). Zonas: Constitución, Gonzalitos, Centro, Fundidora, Valle Oriente.

**Reglas de contenido (legales, no romper):**
- Nunca decir "donación", "inversión" ni "apoyo con retorno". Es **espacio publicitario** o **un mensaje**.
- No prometer vistas, ventas ni resultados a las marcas.
- No prometer reembolsos.
- No usar logos de marcas reales en las maquetas. Usa marcas inventadas ("TACOS DON PEPE", "LLANTERA DEMO").
- Si un video muestra la marca de un cliente que pagó, marcarlo como **promoción pagada** en la plataforma.
- Música solo de la biblioteca de la red social o libre de derechos.

---

## 1. Formato técnico

- **Composición:** 1080 × 1920, **60 fps** (igual que el video de referencia), H.264, `--crf 18`.
- **Duración:** 18-35 s la mayoría; 40-60 s para historias.
- **Zonas seguras (TikTok / Reels / Shorts):** el texto importante va entre **y = 260 y y = 1480**, y entre
  **x = 80 y x = 940** (la columna derecha la tapan los botones y abajo va la descripción).
- **Gancho en los primeros 0.8 s:** algo se mueve o se rompe desde el frame 0. Nunca empezar con una pantalla quieta.
- **Ritmo:** un cambio visual cada **0.6-1.2 s** (corte, zoom, sticker, número). Subtítulos de **1 a 3 palabras**
  por golpe.
- **Fotogramas en este documento:** todos los tiempos de `IDEAS.md` están en segundos; a 60 fps, 1 s = 60 frames.

Render:

```bash
npx remotion render <CompositionId> out/<id>.mp4 --codec=h264 --crf=18
```

---

## 2. Sistema visual: mezcla de la página y del video de referencia

Referencia de formato: `docs/videos/ref/formato-referencia-1.jpg` y `-2.jpg`. Es una versión vieja; **usa solo el
formato, no los números**.

### Paleta (idéntica a la página)

```ts
export const C = {
  asphalt: '#18171b', asphalt2: '#232127', wall: '#26252a',
  paper: '#ece6d6', paper2: '#d9d0bb', news: '#e6e1d3', kraft: '#c4a273',
  ink: '#141214', race: '#e2252e', tape: '#f1c232', blue: '#2f6fe0', ok: '#3fb36b', muted: '#9a94a0',
};
```

### Tipografías (con `@remotion/google-fonts`)

| Uso | Fuente |
|---|---|
| Subtítulos y títulos grandes | `BowlbyOne` (la del sitio). Si quieres el look exacto del video viejo, `LilitaOne` |
| Letras recortadas "de secuestro" | `BowlbyOne`, `AbrilFatface`, `RubikMonoOne`, `Bungee`, `AlfaSlabOne`, `SpecialElite`, `Tinos`, `UnifrakturMaguntia` |
| Etiquetas, datos, contadores | `JetBrainsMono` |
| Máquina de escribir (notas, "archivo") | `SpecialElite` |
| Graffiti y mensajes escritos a mano | `PermanentMarker`, `SedgwickAveDisplay`, `RubikWetPaint` |
| Periódico | `Tinos` (itálica) + `UnifrakturMaguntia` para el nombre |

### Recursos que se copian del repo de la página (`public/`)

- `img/paper.webp`: textura de papel arrugado; se multiplica sobre los colores.
- `img/a0.webp` … `img/a9.webp`: letras "A" recortadas de revista, para los títulos de secuestro.
- `img/halftone.webp`: foto en puntos de imprenta, para el periódico.
- `img/palio-foto.webp`: foto del Palio plateado.
- `models/palio.glb`: **el modelo 3D del Palio**. Cada pieza es una malla con nombre: `cofre`, `techo`,
  `puerta-di`, `puerta-ti`, `puerta-dd`, `puerta-td`, `salpi-i`, `salpi-d`, `costado-i`, `costado-d`, `porton`,
  `defensa-d`, `defensa-t`, `parabrisas`, `medallon`, más `glass`, `body`, etc.
  - Los costados se pintan junto con su puerta trasera.
  - El UV de `cofre` y `techo` viene volteado: invierte la V (`v = 1 - v`) o el logo saldrá en espejo.
  - Esta lógica ya está resuelta en `src/three/remap.ts` y `src/three/paint.ts` del repo de la página; cópiala.
- Algoritmo de letras recortadas: `src/lib/ransom.ts` (`layoutRansom(text, seed, bold)`). Cópialo tal cual; es
  determinista, así que el mismo texto sale igual siempre.

### Lenguaje visual

1. **Fondos:**
   - Pared de block oscura (`C.wall` + líneas de junta + viñeta), con graffiti tenue y stickers.
   - **Papel arrugado claro** (`paper.webp`) para las escenas de "archivo/explicación", como en la referencia.
   - **Rayos rojos** (sunburst, `C.race` / `#b3161d`) para los cierres con llamada a la acción.
   - **Negro con gradiente** para el carro 3D.
2. **Títulos:** letras recortadas (ransom) sobre un marco de papel roto, que caen una por una con rebote
   (`spring`, rotación inicial de −18° y escala 1.9 → 1, con 45 ms entre letras).
3. **Subtítulos:** `BowlbyOne` blanco con borde tinta de 10 px (`paint-order: stroke`) y sombra dura `4px 6px 0`.
   La palabra clave va dentro de una **cinta de color** (`C.tape` o `C.race`) un poco rotada, como "PEDAZOS",
   "MILLION" o "PALIO" en la referencia.
4. **Tarjetas "archivo.jpg":** foto con borde blanco, nombre de archivo arriba (`MiPalio2013.jpg`) en
   `JetBrainsMono` y etiqueta de cinta amarilla con el año, sobre papel roto (`clip-path` irregular).
5. **Cinta adhesiva y stickers:** cada etiqueta "se pega" con una rotación pequeña (±4°), escala 1.15 → 1 y sombra
   dura. Sonido de cinta en cada una.
6. **Transición firma: la cortina de garage.** Una cortina de lámina baja (0.5 s, rápida al inicio y lenta al
   final), la pantalla tiembla 3 frames, y sube (0.7 s). Lleva "PROYECT CAR" en aerosol y un letrero de papel
   "SIGUIENTE PARADA: …". Es la misma que en la página. Úsala para cambiar de capítulo, máximo una o dos por video.
7. **Medidor de la meta:** barra con rayas rojas en diagonal, carrito 🏎️ en la punta, banderita de cuadros al final
   y número grande que cuenta hacia arriba (`interpolate` con `Easing.out(Easing.cubic)`). Texto "META PROJECT CAR
   $X / $150,000".
8. **Tarjeta de precio:** papel blanco con cinta arriba, nombre de la pieza en mono y precio grande con brillo del
   color de la pieza (`text-shadow` del mismo color), como "COFRE $25,000" en la referencia.
9. **Energía:** líneas de velocidad estilo manga (radiales, 40-60 líneas que parpadean), zoom de golpe de 1.0 a 1.08
   en 6 frames en las palabras fuertes, y temblor con `noise2D` de `@remotion/noise`.

---

## 3. Componentes que hay que crear una vez (`src/components/`)

| Componente | Props | Qué hace |
|---|---|---|
| `PaperBg` | `variant: 'crumpled' \| 'wall' \| 'sunburst' \| 'dark'` | fondos de la sección 2 |
| `RansomTitle` | `text, seed, bold?, startFrame` | letras recortadas con caída y rebote (usa `layoutRansom`) |
| `KineticCaptions` | `captions: Caption[], highlight: string[]` | subtítulos palabra por palabra al ritmo de la voz, con cinta en las palabras clave |
| `TapeLabel` | `text, color, rotate, at` | etiqueta de cinta que se pega con rebote |
| `FileCard` | `src, filename, year?, at` | tarjeta "archivo.jpg" sobre papel roto |
| `SpeedLines` | `intensity` | líneas radiales de manga |
| `GarageDoor` | `label, at` | transición de cortina (presentación custom de `@remotion/transitions`) |
| `GoalMeter` | `raised, goal=150000, at, duration` | medidor con conteo |
| `PriceCard` | `part, price, color, perUnit?` | tarjeta de precio con brillo |
| `PalioScene` | `paint: Record<pieza, {color?, text?}>, camera, spin` | Palio 3D con `@remotion/three` |
| `PixelGrid` | `fill: 0..1` | cuadrícula de la Million Dollar Homepage llenándose |
| `Newspaper` | `headline, deck, unfoldAt` | periódico doblado que se abre (estilo de la página) |
| `MessageWall` | `messages: string[], highlight?` | salpicadera con mensajes en plumón, como la de la página |
| `CTAEnd` | `line1, url='proyectcar.com', sticker` | cierre: rayos rojos + "ENTRA A PROYECTCAR.COM" + sticker + `<QR>` opcional |
| `Stamp` | `text` | sello rojo ("SE VENDE", "AGOTADO") que golpea con escala 2 → 1 |
| `Footage` | `src, from, speedRamp?, kenBurns?` | `<OffthreadVideo>` con rampa de velocidad y zoom lento |

### Reglas de Remotion que el modelo tiene que respetar

- **Todo se anima con `useCurrentFrame()`.** Nada de `setTimeout`, CSS `animation` o `transition`, ni el `useFrame`
  de react-three-fiber. En 3D, la rotación y la cámara se calculan desde el frame actual.
- **Lo aleatorio con `random(seed)`** de `remotion` (confeti, graffiti, temblor), para que cada render salga igual.
- **Assets** con `staticFile()`: `<Img>` para imágenes, `<OffthreadVideo>` para tomas grabadas, `<Audio>` para voz,
  música y efectos.
- **Escenas** con `<Series>` o `<TransitionSeries>` (`@remotion/transitions`: `slide()`, `wipe()`, `fade()`, más
  la `GarageDoor` custom).
- **Plantillas con props:** cada video declara un `schema` de zod en su `<Composition>` (montos, nombres, mensajes),
  para cambiar los números el día que se publica sin tocar código. Montos en `number` y textos en `string`.
- **3D:** `<ThreeCanvas>` de `@remotion/three` y `useGLTF(staticFile('palio.glb'))` dentro de `<Suspense>`. Si
  algo carga asíncrono, envuélvelo en `delayRender()` / `continueRender()`. Rotación sugerida:
  `rotation.y = interpolate(frame, [0, durationInFrames], [0, Math.PI * 2])`.
- **Subtítulos sincronizados con la voz:**
  1. Graba la voz y guárdala como `public/vo/<id>.wav`.
  2. Transcríbela con `@remotion/install-whisper-cpp` (`installWhisperCpp`, `downloadWhisperModel` con
     `medium` o `large-v3` para español, `transcribe` con `tokenLevelTimestamps: true`, y `toCaptions`).
  3. Agrúpala con `createTikTokStyleCaptions` de `@remotion/captions` (`combineTokensWithinMilliseconds: 350`).
  4. Corrige a mano las palabras regias que el modelo escriba mal.

  El texto en pantalla sigue exactamente lo que dices.
- **Audio en capas:**
  - Voz a 0 dB.
  - Música a −18 dB, bajando a −24 dB mientras hablas (`volume` como función del frame).
  - Efectos a −8 dB: cinta, papel, aerosol, caja registradora, motor, cortina de lámina, whoosh.

---

## 4. Cómo grabar las tomas reales (para que conecte)

La animación es lo que más se hace en Remotion: textos, stickers, el 3D, el medidor. Pero **lo que hace que la gente
crea y se quede son las tomas reales**: tú, el carro, la calle, el sonido. Cada video de `IDEAS.md` trae su lista
de tomas. Reglas generales:

- **Cámara:** celular vertical, 4K a 30 fps o 1080p a 60 fps. Con 60 fps puedes hacer cámara lenta. Bloquea la
  exposición y el enfoque (mantén el dedo en la pantalla). Limpia el lente.
- **Luz:** hora dorada (1 h antes del atardecer) para el carro. A mediodía, solo tomas en sombra.
- **Cada toma de 3 a 5 s, sin mover el celular de golpe.** Graba 3 versiones de cada una. Para los cortes de golpe,
  haz *whip pans*: mueve el celular rápido al final de una toma y al inicio de la siguiente.
- **Sonido ambiente siempre:** el arranque en frío, la puerta, el claxon, la calle, la cinta. Es oro para el gancho.
- **Tú a cámara:** con la cámara frontal, a la altura de los ojos, a un brazo de distancia, con el carro de fondo.
  Habla como le hablarías a un compa, no como comercial.
- **Fondo de Remotion:** recorta tu figura con la cámara del celular en "retrato", o graba contra una pared lisa,
  para poder ponerte encima de los fondos de papel.

### Tomas base que conviene grabar UNA vez y reusar en todo

1. Arranque en frío del Palio, de cerca al escape y después desde el asiento.
2. Paseo alrededor del carro, a 360°, despacio y a la altura de la cintura.
3. **Cinta masking en cada pieza con el precio escrito en plumón**, una toma por pieza: mano pegando y mano
   escribiendo. Es el puente perfecto entre lo real y la estética de cinta.
4. Mano golpeando el cofre, abriendo la puerta y pasando la mano por la salpicadera.
5. POV manejando por Garza Sada, Constitución y Gonzalitos (con el celular en soporte, nunca en la mano).
6. El carro estacionado en Fundidora, en el Centro (Macroplaza) y en Valle Oriente.
7. Toma de dron o de un puente, con el carro pasando (opcional, pero mata).
8. Tú escribiendo un mensaje de ejemplo con plumón en un pedazo de vinil o en papel encima de la salpicadera.
9. Pantalla grabada de **proyectcar.com**: el garage 3D, el menú de piezas, el checkout y el periódico. Grábala con
   la grabadora del celular y también en la compu a 1080 × 1920.

## 5. Cómo grabar el audio (voz)

- **Dónde:** un clóset con ropa o un cuarto con cortinas y cama, que absorben el eco. Nunca en baño ni cocina.
- **Con qué:** micrófono de solapa (de $300-600 MXN) o el celular a 15-20 cm de la boca, de lado (no de frente)
  para evitar los golpes de aire en las "p".
- **Cómo:**
  - Lee el guion 2 veces en voz alta antes de grabar.
  - Graba 3 tomas completas y quédate con la mejor.
  - Deja 1 s de silencio al inicio para limpiar el ruido.
  - Habla 10% más rápido y más fuerte que normal: en redes se escucha plano si no.
- **Energía:** el gancho (primeros 2 s) va al 120%. Sonríe al hablar, se escucha.
- **Marcas en los guiones:**
  - `[pausa]` = medio segundo.
  - **MAYÚSCULAS** = golpe de voz.
  - `(...)` = indicación, no se lee.
- **Formato del archivo:** `.wav`, 48 kHz. Nómbralo `vo-<id>.wav` y pásalo a `public/vo/`.
