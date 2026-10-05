# Ideas de video · Proyect Car

Todas se pueden **producir antes de lanzar la página**. Las marcadas con 🧩 son **plantillas**: el video se arma
antes y el día de publicar solo cambias los props (montos, mensajes, nombres) en Remotion.

Antes de cada prompt, pega en Claude Code el [brief maestro](BRIEF_REMOTION.md). Cada prompt asume que los
componentes de la sección 3 del brief ya existen; si no, el primer video los crea.

**Público:**
- 🚗 La comunidad car: gente de JDM, drift, proyectos y car meets, la que sigue a Kenji Nakamura.
- 🧑‍🤝‍🧑 Personas que quieren participar con $100.
- 🏪 Negocios chicos de Monterrey. A ellos se les llega por correo; estos videos son el material que se les manda.

**Recursos del rubro que se usan, con estilo propio:**
- Proyecto por capítulos ("Ep. 1, 2, 3…").
- Presupuesto en pantalla.
- Historia con corazón (de dónde viene el carro).
- Arranque en frío como gancho.
- POV manejando.
- Ficha técnica tipo videojuego (las barras del garage).
- Comunidad que decide (encuestas en comentarios).
- "Respondiendo a @…".
- Antes y después.

Todo envuelto en papel, cinta y letras recortadas, para que se reconozca el formato propio en medio segundo.

---

## Calendario

| Día | Video 1 | Video 2 | Video 3 |
|---|---|---|---|
| **Pre** (opcional, días −3 a −1) | T1 · ¿Cuánto vale mi carro en pedazos? | T2 · La idea más tonta o más genial | T3 · El garage abre en 24 h |
| **1 · Lanzamiento** | V01 · Voy a vender mi carro en pedazos | V02 · ¿Cuánto cuesta cada pieza? | V03 · Con $100 te subes al carro |
| **2** | V04 · La historia de mi Palio | V05 · La Million Dollar Homepage en 40 s | |
| **3** | V06 · Ustedes eligen mi project car | V07 · 🧩 Leyendo sus mensajes #1 | |
| **4** | V08 · POV: eres un negocio y compras el cofre | V09 · Esto cuesta anunciarte en mi carro | |
| **5** | V10 · Hice un garage de videojuego para venderlo | V11 · 🧩 Respondiendo a @… "¿y si nadie compra?" | |
| **6** | V12 · Por dónde va a andar tu marca | V13 · 🧩 Así va la meta | |
| **7** | V14 · Ideas de mensaje (y a quién regalárselo) | V15 · 🧩 Semana 1: lo que pasó | |
| **Banco** | V16 · Así se va a ver lleno | V17 · El periódico | V18 · Ficha técnica: el Palio |
| **Banco** | V19 · Carta para negocios (16:9 y 9:16) | | |

**Horarios sugeridos en Monterrey:** 1:00-2:30 pm (comida) y 7:30-10:00 pm. El día 1, los tres a las 12:00, 3:00 y
8:30 pm.

---

## PRE-LANZAMIENTO (opcional)

### T1 · "¿Cuánto vale mi carro… en pedazos?" (12 s)

**Objetivo:** curiosidad, sin explicar nada. **Gancho:** cinta masking pegándose en el cofre con un "$???" escrito.

**Guion (voz):**
> (0-2 s) ¿Cuánto vale mi carro… [pausa] **EN PEDAZOS**?
> (2-7 s) Cofre, puertas, defensas… cada pieza tiene precio.
> (7-12 s) El **lunes** les digo por qué. Y ustedes van a ser parte.

**Tomas:**
- (a) Close-up: mano pegando cinta masking en el cofre y escribiendo "$???" con plumón.
- (b) Lo mismo en una puerta y en una defensa.
- (c) Paseo lento alrededor del carro, de noche, con las luces prendidas.

**Escenas:**

| Tiempo | Visual | Texto en pantalla | Componente |
|---|---|---|---|
| 0-2 s | toma (a) con `SpeedLines` encima | "¿CUÁNTO VALE?" | `Footage`, `KineticCaptions` |
| 2-7 s | cortes (b) a 0.8 s c/u; una `TapeLabel` "$???" por pieza | "COFRE · PUERTAS · DEFENSAS" | `TapeLabel` |
| 7-12 s | (c) que se oscurece; `Stamp` "PRÓXIMAMENTE" | "EL LUNES" | `Stamp` |

```text
PROMPT CLAUDE CODE · T1
Crea la composición "T1-Teaser" (1080x1920, 60fps, 12 s) siguiendo el brief.
Props (zod): footageA, footageB[], footageC (rutas en public/footage), launchDay="LUNES".
0-2s: <Footage src={footageA}> con SpeedLines intensity 0.6 y KineticCaptions de vo-T1.wav (palabra clave "PEDAZOS" en cinta roja).
2-7s: <Series> con cada footageB de 0.8s, cortes duros con zoom de golpe 1→1.08 en 6 frames; sobre cada una, TapeLabel "$???" en C.tape con rotate aleatorio random(seed) entre -6 y 6 y sonido de cinta.
7-12s: footageC con oscurecimiento progresivo (interpolate opacidad 0→0.6) y Stamp "PRÓXIMAMENTE" a los 9s; texto "EL {launchDay}" en BowlbyOne 120px.
Audio: vo-T1.wav, música tensa a -20dB, sfx-tape en cada TapeLabel, sfx-stamp en el sello.
```

**Descripción:** "¿Cuánto vale mi carro en pedazos? 👀 El lunes les digo. #projectcar #autos #monterrey #mty #fiat #palio"
**Comentario fijado:** "Adivinen cuánto vale el cofre 👇"

---

### T2 · "La idea más tonta (o más genial) que he tenido" (20 s)

**Objetivo:** plantar la referencia de la Million Dollar Homepage. **Gancho:** cuadrícula de pixeles explotando en
colores.

**Guion:**
> (0-3 s) Esta es la idea más TONTA… o más GENIAL que he tenido.
> (3-10 s) En 2005 un chavo vendió **un millón de pixeles** a un dólar cada uno… [pausa] y se hizo millonario.
> (10-16 s) Yo no tengo pixeles. Tengo **un Palio 2013**.
> (16-20 s) ¿Ya saben qué voy a hacer?

**Tomas:**
- (a) Tú a cámara, serio, con el carro de fondo, diciendo la primera línea.
- (b) Mano en el volante y el tablero encendido.

**Escenas:**

| Tiempo | Visual | Texto | Componente |
|---|---|---|---|
| 0-3 s | (a) recortado sobre `PaperBg crumpled` | "TONTA… o GENIAL" (dos cintas: gris y amarilla) | `Footage`, `TapeLabel` |
| 3-10 s | `FileCard` "MillionDollar.jpg" con `PixelGrid` de 0 a 1; `TapeLabel` "1,000,000 PX" y "$1 USD" | | `PixelGrid`, `FileCard` |
| 10-16 s | `FileCard` "MiPalio2013.jpg" con `palio-foto.webp`; sticker "2013" | "UN PALIO 2013" | `FileCard` |
| 16-20 s | (b) con `SpeedLines` y zoom | "¿YA SABEN?" | |

```text
PROMPT CLAUDE CODE · T2
Composición "T2-LaIdea" (20s). Fondo PaperBg crumpled en 3-16s.
PixelGrid: 40x40 celdas que se llenan en orden aleatorio determinista (random('mdh'+i)) con la paleta C, entre los frames 180 y 540; 4 bloques grandes (amarillo, rojo, azul, verde) aparecen como "anuncios" a los 300, 360, 420 y 480.
FileCard filename="MillionDollar.jpg" con rotación -2°, y luego FileCard "MiPalio2013.jpg" con img/palio-foto.webp entrando desde abajo con spring (damping 12).
Transición entre las dos tarjetas: wipe() de 12 frames.
Captions de vo-T2.wav con highlight ["TONTA","GENIAL","millón","Palio"].
Cierre 16-20s: footage del volante con SpeedLines intensity 1 y zoom 1→1.15.
```

**Descripción:** "En 2005 alguien vendió 1 millón de pixeles… yo voy a hacer algo parecido con mi carro 🚗 #milliondollarhomepage #projectcar #mty"

---

### T3 · "El garage abre en 24 horas" (10 s)

**Gancho:** la cortina de garage cayendo de golpe con el sonido de la lámina.

**Guion:**
> (0-3 s) Mañana abro el garage.
> (3-7 s) 12 piezas. Un carro. **Una meta**.
> (7-10 s) Activa la notificación. Se van a acabar.

**Tomas:** (a) tu mano bajando una cortina de garage real. Si no tienes, la cajuela cerrándose. (b) El carro dentro
del garage, a oscuras, y una lámpara que se prende.

```text
PROMPT CLAUDE CODE · T3
Composición "T3-Countdown" (10s). Abre con GarageDoor cerrándose en el frame 0 (sin abrir) y el letrero "MAÑANA: EL GARAGE".
3-7s: footage (b) con flash blanco de 4 frames cuando se prende la lámpara; RansomTitle "12 PIEZAS" (seed 12), luego "1 META" (seed 1).
7-10s: contador grande "24:00:00" en JetBrainsMono que baja 1 segundo por cada 10 frames (efecto acelerado), y CTAEnd corto con "ACTIVA LA NOTIFICACIÓN".
SFX: sfx-garage-door, sfx-light-switch, tic-tac.
```

---

## DÍA 1 · LANZAMIENTO

### V01 · "Voy a vender mi carro en pedazos" (30 s) · el principal

**Objetivo:** la versión nueva del video de referencia, con los números actuales. **Es el que más se va a
compartir.** **Gancho:** "VOY A VENDER" sobre tráfico con líneas de velocidad, y el Palio 3D explota en piezas.

**Guion:**
> (0-3 s) Voy a vender mi carro… [pausa] **EN PEDAZOS**.
> (3-6 s) Para comprar mi **project car**.
> (6-11 s) ¿Conocen la Million Dollar Homepage? Un chavo vendió **un millón de pixeles**, a **un dólar** cada uno.
> (11-14 s) Yo voy a hacer lo mismo… con mi **Palio 2013**.
> (14-22 s) Cofre, dieciocho mil. Puertas, desde nueve mil quinientos. Defensas, ocho mil… [pausa] cada pieza lleva **tu marca**.
> (22-26 s) ¿No tienes marca? Con **cien pesos** dejas tu mensaje… y tu nombre va en el techo.
> (26-30 s) Entra a **proyectcar.com**. Antes de que se acaben… [pausa] y hagamos **historia**.

**Tomas:**
- (a) Tráfico de Garza Sada desde un puente, de 3 s.
- (b) Cinta con el precio en el cofre, en una puerta y en una defensa.
- (c) Tú a cámara diciendo "¿No tienes marca?".
- (d) Mano escribiendo un mensaje con plumón en la salpicadera (en un papel encima).

**Escenas:**

| Tiempo | Visual | Texto | Componente |
|---|---|---|---|
| 0-1 s | (a) con blur radial + `SpeedLines` | "VOY A VENDER" | `Footage`, `KineticCaptions` |
| 1-3 s | `PalioScene` sobre fondo rojo oscuro; las piezas salen volando (cada malla con un offset que crece con `spring`) | "EN **PEDAZOS**" (cinta roja) | `PalioScene` |
| 3-6 s | `PaperBg sunburst` naranja-rojo + `FileCard` "MiProjectCar.jpg" con un "?" grande | "PARA COMPRAR MI **PROJECT**" | `FileCard` |
| 6-11 s | `PaperBg crumpled` + `FileCard` "MillionDollar.jpg" con `PixelGrid`; etiquetas "1,000,000 PX" y "$1 DÓLAR" | "¿CONOCES LA **MILLION**…" | `PixelGrid` |
| 11-14 s | `FileCard` "MiPalio2013.jpg" con `palio-foto.webp` + sticker "2013" | "CON MI **PALIO**" | |
| 14-22 s | `PalioScene` girando; cada pieza se pinta en su color al mencionarla + `PriceCard`; arriba, un medidor "SI SE VENDE TODO" que suma lo que valen las piezas hasta llegar a **$150,000 MXN** con brillo (como el "$120,000" de la referencia) | "COFRE $18,000" / "PUERTAS desde $9,500" / "DEFENSAS $8,000" | `PalioScene`, `PriceCard`, `GoalMeter` |
| 22-26 s | (c) recortado sobre la pared + `MessageWall` con mensajes que se escriben solos + `TapeLabel` "NOMBRE GRATIS EN EL TECHO" | "**$100** = TU MENSAJE" | `MessageWall` |
| 26-30 s | `CTAEnd`: "ENTRA A PROYECTCAR.COM" + sticker "COMPRA TU ESPACIO HOY" + "ANTES DE QUE SE ACABEN" → "Y HAREMOS **HISTORIA**" | | `CTAEnd` |

```text
PROMPT CLAUDE CODE · V01
Crea "V01-Presentacion" (30s, 1080x1920, 60fps) replicando la estructura del video de referencia (ref/formato-referencia-*.jpg) pero con el sistema visual del brief y estos datos:
schema zod: { goal: 150000, prices: [{part:'COFRE',price:18000,color:C.race},{part:'PUERTAS',price:9500,perUnit:true,from:true,color:C.blue},{part:'DEFENSAS',price:8000,perUnit:true,color:C.tape}], messagePrice:100 }.
Escena 1-3s: PalioScene con explode: cada malla de pieza se desplaza en su normal promedio * spring(frame-60, {damping:10}) * 0.6 y gira levemente; fondo radial #3a0d10→#120507; 30 confetis de papel (random) en colores de la paleta.
Escena 14-22s: PalioScene spin lento; al frame de cada mención (sacarlo de los captions de whisper: palabra "cofre", "puertas", "defensas") pinta la pieza con su color (material.color lerp 0.3s) y entra PriceCard desde abajo con spring. Arriba (y=260) un GoalMeter con título "SI SE VENDE TODO" (NO "juntado": el día del lanzamiento no hay ventas) que avanza por tramos al mencionar cada pieza y al final acelera hasta goal, rematando con "$150,000 MXN" gigante en C.race con brillo (text-shadow 0 0 40px) y temblor de 4 frames.
Escena 22-26s: footage (c) recortado (si viene con alfa, .webm VP9) a la izquierda y MessageWall a la derecha con 6 mensajes de ejemplo que se escriben letra por letra en PermanentMarker (1 letra cada 2 frames).
Cierre CTAEnd idéntico en estructura al de la referencia: rayos rojos girando 0.2°/frame, "ENTRA A" (60px) / "PROYECTCAR" (120px) / ".COM" (120px), sticker naranja→amarillo "COMPRA TU ESPACIO HOY", "ANTES DE QUE SE ACABEN" con "ACABEN" en cinta roja, y al final "Y HAREMOS HISTORIA" con "HISTORIA" en cinta amarilla que se llena de izquierda a derecha.
Transiciones: cortes duros con zoom de golpe; una sola GarageDoor entre 11s y 14s con label "EL GARAGE".
Audio: vo-V01.wav; música energética a -18dB con ducking; sfx: whoosh en cada corte, cash-register en cada PriceCard, tape en cada TapeLabel, explosion-paper en el frame 60.
```

**Descripción:** "Voy a vender mi carro en pedazos para comprar mi project car 🧩🚗 ¿Qué pieza te quedas? proyectcar.com #projectcar #autos #mty #monterrey #milliondollarhomepage #fiatpalio"
**Comentario fijado:** "¿Qué pondrías en el cofre? 👇 (link en mi perfil)"

---

### V02 · "¿Cuánto cuesta cada pieza?" (35 s)

**Objetivo:** catálogo con ritmo, como "selección de personaje" de videojuego. **Gancho:** la cinta en el cofre se
pega con un golpe y el precio aparece en grande.

**Guion:**
> (0-2 s) Este es el precio de **cada pieza** de mi carro.
> (2-5 s) Cofre: **dieciocho mil**. Es lo que más se ve.
> (5-8 s) Franja del parabrisas: trece mil. La ves en cada video, de frente.
> (8-12 s) Portón y medallón: doce mil cada uno. El que viene atrás de mí en el tráfico… te ve **sí o sí**.
> (12-17 s) Puertas traseras: diez mil quinientos; las delanteras, nueve mil quinientos.
> (17-21 s) Defensas: ocho mil. Ventanas traseras: siete mil quinientos.
> (21-26 s) Y las salpicaderas son de la raza: **cien pesos** por mensaje.
> (26-30 s) Seis meses tu marca rodando por Monterrey y en todos los videos.
> (30-35 s) Elige tu pieza en **proyectcar.com**.

**Tomas:**
- (a) Una toma por pieza: mano pegando la cinta con el precio, 1.5 s c/u.
- (b) Grabación de pantalla del garage de la página, recorriendo el menú de piezas.

**Escenas:**

| Tiempo | Visual | Texto | Componente |
|---|---|---|---|
| 0-2 s | (a) del cofre en cámara lenta + `Stamp` "LISTA DE PRECIOS" | | `Footage`, `Stamp` |
| 2-21 s | Pantalla dividida: arriba la toma (a) de la pieza; abajo `PalioScene` con esa pieza resaltada en amarillo; a la derecha la ficha del garage (las 3 barras: Visibilidad, Tamaño y Tiempo en video, que se llenan) | `PriceCard` por pieza | `PalioScene`, `StatBars` (nuevo) |
| 21-26 s | `MessageWall` + `TapeLabel` "+ NOMBRE GRATIS EN EL TECHO" | "$100" | `MessageWall` |
| 26-30 s | `GarageDoor` → `GoalMeter` en 0 / $150,000 | "6 MESES · EN CADA VIDEO" | `GoalMeter` |
| 30-35 s | `CTAEnd` + (b) en un marco de celular | | `CTAEnd` |

```text
PROMPT CLAUDE CODE · V02
Crea "V02-Precios" (35s). Nuevo componente StatBars({vis,tam,cuadro}) idéntico a las barras del garage de la página: 10 segmentos inclinados skewX(-14deg), color C.race y los dos últimos #a3131a, que se encienden uno por uno con 3 frames de retraso.
Datos (zod array): [{id:'cofre',name:'COFRE',price:18000,vis:9,tam:8,cuadro:9},{id:'parabrisas',name:'FRANJA DEL PARABRISAS',price:13000,vis:9,tam:4,cuadro:9},{id:'porton',name:'PORTÓN',price:12000,vis:8,tam:6,cuadro:7},{id:'medallon',name:'MEDALLÓN',price:12000,vis:8,tam:5,cuadro:7},{id:'puerta-td',name:'PUERTA TRASERA',price:10500,vis:7,tam:7,cuadro:7},{id:'puerta-dd',name:'PUERTA DELANTERA',price:9500,vis:8,tam:6,cuadro:8},{id:'defensa-d',name:'DEFENSA',price:8000,vis:7,tam:3,cuadro:6},{id:'vidrio-td',name:'VENTANA TRASERA',price:7500,vis:7,tam:4,cuadro:6}].
Layout 2-21s: footage en la mitad superior (0-960px) con borde de papel roto; mitad inferior: PalioScene con la cámara que vuela a cada pieza (misma tabla VIEWS de la página: Frente, Atrás, Arriba, Lado izq., Lado der.), pieza activa en C.tape con pulso emissive; PriceCard en y=1250 y StatBars debajo. Cada pieza dura lo que dura su frase en los captions.
Cierre con GarageDoor (label "LA META") → GoalMeter 0/150000 → CTAEnd.
SFX: tape por pieza, "select" de videojuego (beep) al cambiar de pieza, cash-register en cada precio.
```

**Descripción:** "Lista de precios oficial 🏷️ ¿Cuál es la mejor pieza para tu negocio? #projectcar #publicidad #mty #negociosmonterrey"
**Comentario fijado:** "Si tienes negocio en MTY, ¿qué pieza escogerías?"

---

### V03 · "Con $100 te subes al carro" (22 s)

**Objetivo:** el producto masivo. **Gancho:** "NO TIENES MARCA?" con tu cara de sorpresa.

**Guion:**
> (0-2 s) ¿No tienes marca? **No importa**.
> (2-7 s) Con **cien pesos** escribes un mensaje de hasta veinticuatro letras… y lo rotulo en mi carro.
> (7-11 s) Y de regalo… [pausa] tu nombre va en el **techo**.
> (11-16 s) Un saludo, una dedicatoria, tu apodo, lo que quieras… menos groserías, eh.
> (16-22 s) Hasta agotar existencias. **proyectcar.com**.

**Tomas:**
- (a) Tú a cámara con cara de "¿neta no tienes marca?".
- (b) Mano escribiendo con plumón "¡Arre con el project!" sobre un papel encima de la salpicadera, a 60 fps para
  cámara lenta.
- (c) Toma desde arriba (escalera o puente) del techo.

```text
PROMPT CLAUDE CODE · V03
"V03-Mensajes100" (22s). Schema: {examples: string[] (6 mensajes de <=24 chars), price:100, maxChars:24}.
0-2s: footage (a) con zoom de golpe y TapeLabel "¿NO TIENES MARCA?".
2-7s: footage (b) a 0.5x (speed ramp: 1x→0.5x en 10 frames) y encima un contador de caracteres en JetBrainsMono "0/24" que sube al ritmo de las letras; al llegar, Stamp verde "CABE ✓".
7-11s: PalioScene con cámara desde arriba (y=6) bajando hacia el techo; el techo muestra la textura de nombres (portar namesCanvas de la página) y un nombre nuevo aparece resaltado en amarillo.
11-16s: MessageWall llenándose con examples (1 cada 0.7s) y un mensaje tachado en rojo "#$%&!" con Stamp "NO".
16-22s: CTAEnd con sticker "$100 · HASTA AGOTAR EXISTENCIAS".
```

**Descripción:** "Por $100 tu mensaje va en mi carro y tu nombre en el techo ✍️ ¿Qué escribirías? #projectcar #mty #autos"
**Comentario fijado:** "Escriban aquí su mensaje (24 letras máx) y los mejores los leo en video 👇". Esto alimenta el V07.

---

## DÍA 2

### V04 · "La historia de mi Palio" (45-55 s)

**Objetivo:** corazón, el recurso más fuerte del rubro. **Gancho:** el arranque en frío y la frase "Este carro ha
estado conmigo en todo".

> ✏️ **Llena el guion con tu historia real.** Los `[ ]` son huecos que solo tú puedes contar. Si no es verdad, no lo digas.

**Guion (base):**
> (0-4 s) (sonido del arranque) Este carro ha estado conmigo en **todo**.
> (4-14 s) Lo [compré / me lo dieron] en [año] … [momento importante: primer trabajo, la uni, un viaje].
> (14-24 s) Pero siempre quise un **project car**: uno para [arreglar / correr / aprender]… y nunca había dinero.
> (24-34 s) Así que se me ocurrió algo: que el Palio me ayude a conseguirlo. Que cada pieza la tenga **alguien de Monterrey**.
> (34-44 s) No lo voy a vender. Lo voy a **convertir** en algo de todos.
> (44-52 s) Si quieres ser parte… proyectcar.com. [pausa] Gracias por llegar hasta aquí.

**Tomas:**
- (a) Arranque en frío: llave y escape.
- (b) Fotos viejas reales del carro, en papel o en pantalla.
- (c) Manos en el volante.
- (d) Caminata lenta alrededor, de noche, con las luces prendidas.
- (e) Tú sentado en el cofre, mirando a cámara.

```text
PROMPT CLAUDE CODE · V04
"V04-Historia" (52s, más lenta). Música emotiva (piano/lo-fi) a -16dB.
Fotos reales del usuario como FileCard ("Palio_[año].jpg") que se apilan sobre PaperBg crumpled con rotaciones ±5° y cinta en las esquinas; una cada 3s con un Ken Burns de 1.0→1.06.
Captions más calmados: 2-4 palabras por golpe, sin zoom de golpe; solo las palabras "todo", "project car", "Monterrey" y "convertir" van en cinta.
34-44s: PalioScene sin explotar, girando lentamente, y luego cada pieza se colorea una a una (12 piezas en 6s) como si se llenara.
Cierre: CTAEnd versión "tranquila": fondo pared, sin rayos, "PROYECTCAR.COM" en RansomTitle.
```

**Descripción:** "La historia de mi Palio y por qué lo voy a convertir en algo de todos 🧡 #projectcar #historia #autos #mty"

---

### V05 · "La Million Dollar Homepage en 40 segundos" (40 s)

**Objetivo:** dato curioso que se comparte solo, y que te pone como "el que lo hizo con un carro". **Gancho:** "Este
chavo se hizo millonario vendiendo PIXELES".

**Guion:**
> (0-3 s) Este chavo se hizo millonario vendiendo **pixeles**.
> (3-12 s) 2005. Alex Tew, estudiante en Inglaterra. Necesita dinero para la uni. Hace una página con **un millón de pixeles**… y los vende a **un dólar** cada uno.
> (12-22 s) Las marcas compran cuadritos, ponen su logo… y en cuatro meses la página se **llena**.
> (22-30 s) Veinte años después… yo voy a hacer lo mismo. Pero en vez de pixeles… **piezas de un carro**.
> (30-40 s) Y la página la puedes ver ya: **proyectcar.com**.

**Tomas:** solo (a) tú al final señalando el carro. El resto es 100% Remotion.

> ⚠️ Verifica los datos de la historia (año, nombre, plazo) antes de publicar.

```text
PROMPT CLAUDE CODE · V05
"V05-MDH" (40s). Estilo "mini documental de papel": PaperBg crumpled, línea de tiempo con chinchetas, FileCards con nombres "AlexTew_2005.jpg" (ilustración placeholder: silueta en papel recortado, NO foto real) y "MillionDollar.jpg".
PixelGrid grande que se llena del 0 al 100% entre 12 y 22s, con un contador "$0 → $1,000,000" en JetBrainsMono.
22-30s: transición GarageDoor → PalioScene con las piezas como "pixeles gigantes" (cada pieza parpadea en un color al azar, random seed por pieza).
Captions con highlight ["pixeles","millón","dólar","llena","piezas"].
```

**Descripción:** "La página que vendió 1 millón de pixeles a $1… y lo que voy a hacer yo 🧩 #milliondollarhomepage #datoscuriosos #emprendimiento #mty"

---

## DÍA 3

### V06 · "Ustedes eligen mi project car" (30 s)

**Objetivo:** que comenten. La comunidad del rubro ama opinar de proyectos. **Gancho:** tres siluetas de carros
tapadas con una sábana de papel.

**Guion:**
> (0-3 s) Con lo que junte me compro un **project car**… y ustedes lo eligen.
> (3-18 s) Opción uno: [carro A]. Opción dos: [carro B]. Opción tres: [carro C].
> (18-26 s) ¿Cuál? Comenten **uno, dos o tres**. El más votado… es el que busco.
> (26-30 s) Y mientras, súbanse al Palio: proyectcar.com.

> ✏️ Elige 3 carros reales que puedas comprar con el presupuesto, y que tengan público. Por ejemplo, un JDM
> noventero, un clásico gringo de 4 cilindros y un hot hatch europeo. **No uses logos oficiales:** solo siluetas o
> fotos tuyas.

**Tomas:**
- (a) Tú a cámara con tres papeles numerados 1, 2 y 3.
- (b) Si puedes, fotos reales de anuncios de cada opción en Monterrey (con permiso) o tomas de car meets.

```text
PROMPT CLAUDE CODE · V06
"V06-Encuesta" (30s). Schema: options [{n:1,name:'',img:''},{n:2,...},{n:3,...}].
Cada opción: FileCard con su img (o una silueta low-poly gris si no hay foto), un número gigante recortado (RansomTitle "1"/"2"/"3", seeds distintas) y una "ficha" con 3 StatBars inventadas por el usuario (Potencia, Precio, Qué tan project).
18-26s: las 3 tarjetas en fila con un sticker "COMENTA 1, 2 o 3" que rebota; flecha dibujada en marcador hacia abajo (hacia los comentarios).
SFX: drumroll al revelar cada opción.
```

**Descripción:** "¿Cuál project car me compro? Comenten 1, 2 o 3 👇 #projectcar #jdm #autos #mty"
**Comentario fijado:** "1, 2 o 3? El más votado gana 🏁"

---

### V07 · 🧩 "Leyendo sus mensajes #1" (25-40 s)

**Objetivo:** el bucle viral. Quien compra sale en video, lo comparte y llegan más. **Gancho:** "Ya hay
[N] mensajes en mi carro… y algunos están BUENÍSIMOS".

**Guion (plantilla):**
> (0-3 s) Ya hay **[N] mensajes** en mi carro… y algunos están **buenísimos**.
> (3-25 s) "[mensaje 1]" de [nombre]… [tu reacción]. "[mensaje 2]"… [reacción]. (5-8 mensajes)
> (25-30 s) ¿Quieres que lea el tuyo? Cien pesos, proyectcar.com.

> ✏️ Si el día 3 todavía no hay mensajes reales, haz la versión "Leyendo sus COMENTARIOS": lee los mensajes que
> la gente propuso en los comentarios del V03. **Nunca inventes compradores.**

**Tomas:**
- (a) Tú leyendo con el celular en la mano, sentado en el cofre. Reacciones reales: risa, "¡nooo!".
- (b) Close-up de la salpicadera.

```text
PROMPT CLAUDE CODE · V07 (PLANTILLA)
"V07-Mensajes" duración = 5s + messages.length * 3s.
Schema: { count:number, messages:[{text:string,name?:string}] }.
Por mensaje: footage (a) a la izquierda en un marco de papel; a la derecha, MessageWall que hace zoom al mensaje (resaltado en amarillo como en el checkout de la página) y TapeLabel con el nombre "— {name}".
Contador arriba "{count} MENSAJES · HASTA AGOTAR EXISTENCIAS" con cinta roja.
Cierre CTAEnd con sticker "$100 · TU MENSAJE AQUÍ".
```

**Descripción:** "Leyendo sus mensajes del carro #1 😂 ¿El tuyo es el siguiente? #projectcar #mty"

---

## DÍA 4

### V08 · "POV: eres un negocio y compras el cofre" (25 s)

**Objetivo:** que un dueño de negocio se imagine ahí. Es material para los correos a negocios. **Gancho:** "POV:
tienes una taquería y tu logo va en este cofre".

**Guion:**
> (0-3 s) POV: tienes un negocio… y tu logo va en **este cofre**.
> (3-10 s) Entras a proyectcar.com, escoges la pieza, subes tu logo… y así se ve.
> (10-17 s) Lo imprimo en vinil, lo pego… y tu marca anda **seis meses** por Garza Sada, el Tec y Fundidora.
> (17-22 s) Y sale en **todos los videos** del proyecto.
> (22-25 s) ¿Tienes negocio en Monterrey? Ya sabes dónde.

**Tomas:**
- (a) Pantalla grabada del checkout con el logo de ejemplo "TACOS DON PEPE".
- (b) Mano pasando un trapo por el cofre, como preparándolo.
- (c) El carro pasando frente a la cámara en una avenida.

```text
PROMPT CLAUDE CODE · V08
"V08-POVNegocio" (25s). Texto inicial "POV:" en SpecialElite sobre una tira de papel.
3-10s: mock de celular (marco negro redondeado) con la grabación de pantalla (a) dentro; al terminar, PalioScene donde el cofre recibe la textura de marca (portar brandCanvas de la página: color + nombre en BowlbyOne) con una animación de "despegar el vinil": clip-path que avanza de izquierda a derecha.
10-17s: mapa de la página (SVG de src/pages/landing/sections/Where.tsx) con la ruta roja que se dibuja (strokeDashoffset por frame) y pines en Tec, Fundidora y Valle Oriente.
Usar SOLO marcas ficticias.
```

**Descripción:** "Si tienes negocio en MTY, tu logo puede andar 6 meses en mi carro y en todos mis videos 🏪🚗 #negociosmty #publicidad #emprendedoresmx"

---

### V09 · "Esto cuesta anunciarte en mi carro" (30 s)

**Objetivo:** que el precio se sienta accesible, comparado con alternativas. **Gancho:** "¿Cuánto cuesta un
espectacular en Monterrey?".

**Guion:**
> (0-4 s) ¿Cuánto cuesta un espectacular en Monterrey? [cifra investigada] **al mes**.
> (4-10 s) Anuncios en redes: se acaban cuando dejas de pagar.
> (10-20 s) La puerta de mi carro: **nueve mil quinientos**… por **seis meses**, en la calle **y** en internet.
> (20-26 s) Eso es como [cifra / 6] pesos al mes.
> (26-30 s) Piezas limitadas. proyectcar.com.

> ⚠️ **Investiga y anota la fuente** de la cifra del espectacular antes de grabar. No compares con números
> inventados. No prometas vistas ni ventas.

```text
PROMPT CLAUDE CODE · V09
"V09-Comparativa" (30s). Tres "tickets" de papel térmico (fondo #f6f3ea, JetBrainsMono, borde inferior en zigzag) que entran uno por uno: ESPECTACULAR / ANUNCIOS EN REDES / PUERTA PROYECT CAR, cada uno con su precio y "por mes". El de Proyect Car lleva un Stamp verde "6 MESES".
Final: división animada 9500 ÷ 6 = 1,583 contando con interpolate.
```

**Descripción:** "Comparé cuánto cuesta anunciarte en MTY 📊 #marketing #negociosmty #publicidad"

---

## DÍA 5

### V10 · "Hice un garage de videojuego para vender mi carro" (25 s)

**Objetivo:** el ángulo tech, el sitio en sí (diseño y 3D), que atrae a otro público. **Gancho:** la cortina de
garage abriéndose y el menú tipo videojuego.

**Guion:**
> (0-3 s) Para vender mi carro… hice un **garage de videojuego**.
> (3-12 s) Tocas cualquier pieza, la cámara vuela y te enseña sus estadísticas. Visibilidad, tamaño, tiempo en video.
> (12-18 s) Las vendidas toman el color de su marca. Las salpicaderas… tienen sus mensajes.
> (18-25 s) Pruébalo tú: **proyectcar.com**.

**Tomas:** grabación de pantalla del garage, en vertical y en alta: menú, flechas, cámara volando y checkout.

```text
PROMPT CLAUDE CODE · V10
"V10-GarageGamer" (25s). La grabación de pantalla dentro de un marco de celular que hace "dolly" (scale 0.9→1.05) y rota en 3D (perspective 1200px, rotateY ±8°).
Sobreponer UI de videojuego: "PRESS START" parpadeando al inicio, cursor de mano animado que hace clic en las piezas, y "NEW PART UNLOCKED" cuando aparece una vendida.
SFX de menú de videojuego en cada clic.
```

**Descripción:** "Hice un garage de videojuego para vender mi carro por piezas 🎮🚗 #webdev #3d #threejs #projectcar"

---

### V11 · 🧩 "Respondiendo a @… ¿y si nadie compra?" (25 s)

**Objetivo:** responder dudas de los comentarios, un formato que el algoritmo empuja. Prepara 3 versiones con las
dudas más probables: "¿y si nadie compra?", "¿se lo van a quitar después?", "¿es estafa?".

**Guion (versión "¿y si nadie compra?"):**
> (0-3 s) "¿Y si nadie compra?" [pausa] Buena pregunta.
> (3-12 s) Si no llego a la meta, igual: quien compró su pieza **la tiene** rotulada y sale en los videos. El servicio no depende de la meta.
> (12-20 s) Y yo sigo hasta lograrlo. Esto va a ser una **serie**: cada pieza vendida, la grabo.
> (20-25 s) Así que síguenos… para que veas cómo termina.

**Guion (versión "¿es estafa?"):**
> Todo está en proyectcar.com: términos, aviso de privacidad, precio final… y el carro existe: aquí está. (Golpeas el cofre.)

```text
PROMPT CLAUDE CODE · V11 (PLANTILLA)
"V11-Respuesta". Schema: {username:string, comment:string}.
Abre con una "burbuja de comentario" estilo TikTok pero hecha de papel recortado: avatar circular gris, @username en JetBrainsMono y el comentario en Archivo 44px, pegada con cinta y rebote.
Luego footage tuyo a cámara recortado sobre la pared y KineticCaptions; para "¿es estafa?" usar Stamp "REAL" sobre la toma del cofre.
```

---

## DÍA 6

### V12 · "Por dónde va a andar tu marca" (25 s)

**Objetivo:** la ubicación da valor local. **Gancho:** POV manejando + "esta es la ruta".

**Guion:**
> (0-3 s) Si compras una pieza… **por aquí** va a andar tu marca.
> (3-15 s) Base: junto al Tec, en Garza Sada. Entre semana: Constitución, Gonzalitos… donde el tráfico avanza lento.
> (15-21 s) Fines: Centro, Fundidora, Valle Oriente.
> (21-25 s) Y en internet, en **cada video**.

**Tomas:**
- (a) POV con el celular en soporte por cada avenida, de 3 s c/u.
- (b) El carro estacionado en Fundidora y en Valle Oriente.

```text
PROMPT CLAUDE CODE · V12
"V12-Ruta" (25s). Reusar el mapa SVG de la página (src/pages/landing/sections/Where.tsx) como componente: la ruta roja se dibuja con strokeDashoffset sincronizado con cada avenida mencionada; cada vez, picture-in-picture del POV correspondiente en un marco de papel con cinta, y un pin que hace pulse (escala 0.4→1.6, opacidad 0.7→0).
Etiquetas de avenidas en JetBrainsMono, como en el mapa del sitio.
Aclarar con texto pequeño: "Rutas ilustrativas".
```

---

### V13 · 🧩 "Así va la meta" (15-20 s)

**Objetivo:** prueba social y urgencia. Repetible cada semana. **Gancho:** el medidor llenándose.

**Guion (plantilla):**
> (0-3 s) Así va la meta: **[monto]** de ciento cincuenta mil.
> (3-10 s) Ya se fueron: [piezas vendidas]. Gracias a [marcas]. Y ya hay [N] mensajes.
> (10-15 s) Quedan [X] piezas. Hasta agotar existencias.

```text
PROMPT CLAUDE CODE · V13 (PLANTILLA)
"V13-Meta". Schema: { raised:number, goal:150000, soldParts:[{id,brand,color}], messages:number, partsLeft:number }.
PalioScene con las soldParts pintadas con su color y su marca (brandCanvas) girando; GoalMeter grande al centro contando de 0 a raised; lista de piezas vendidas como stickers que se pegan; si partsLeft <= 3, Stamp rojo "ÚLTIMAS PIEZAS".
```

---

## DÍA 7

### V14 · "Ideas de mensaje (y a quién regalárselo)" (25 s)

**Objetivo:** hacerlo regalable. **Gancho:** "Regálale a tu novia algo que ande por toda la ciudad".

**Guion:**
> (0-3 s) ¿Buscas un regalo que nadie más tenga?
> (3-15 s) "Te amo, Caro" en un carro que anda por todo Monterrey. "Para mi papá, que soñó con esto". "Arre, Borregos". "Feliz cumple, Memo".
> (15-21 s) Cien pesos, veinticuatro letras… y el nombre de quien tú quieras en el techo.
> (21-25 s) proyectcar.com.

**Tomas:**
- (a) Tú escribiendo en papel y doblándolo como carta.
- (b) Una pareja o un amigo tuyo leyendo su mensaje en el carro y reaccionando. Real; pídeselo a alguien que de
  verdad compre.

```text
PROMPT CLAUDE CODE · V14
"V14-Regalos" (25s). Cada ejemplo aparece en una "tarjeta de regalo" de papel kraft (C.kraft) con moño de cinta roja, y luego "vuela" hacia la salpicadera 3D (PalioScene) y se queda escrita ahí (MessageWall sobre la textura de la salpicadera).
Corazones/estrellas recortados de papel como confeti (random) en "Te amo, Caro".
```

---

### V15 · 🧩 "Semana 1: lo que pasó" (35-45 s)

**Objetivo:** cierre de capítulo, gratitud y llamado a la segunda semana. **Gancho:** "Hace una semana dije que
iba a vender mi carro en pedazos…".

**Guion (plantilla):**
> (0-4 s) Hace una semana dije que iba a vender mi carro en pedazos…
> (4-20 s) Hoy: [monto], [piezas vendidas], [mensajes], [vistas totales]… [lo más loco que pasó].
> (20-30 s) Gracias a [nombres/marcas]. Esto ya no es mi carro: es **de todos**.
> (30-40 s) La siguiente semana: [plan: primera instalación de vinil, primera ruta, etc.]. Síguenos.

```text
PROMPT CLAUDE CODE · V15 (PLANTILLA)
"V15-Semana1". Abre con un clip de 1.5s del V01 (reusar la composición como <Sequence> anidada) con un filtro de "recuerdo" (sepia 0.4 + viñeta) y el texto "HACE 7 DÍAS".
Luego Newspaper con headline "SEMANA 1: {raised} JUNTADOS" que se desdobla, y estadísticas como recortes de periódico pegados (cinta).
Cierre con el agradecimiento en RansomTitle: "GRACIAS RAZA".
```

---

## BANCO (para días flojos o para reusar)

### V16 · "Así se va a ver lleno" (15 s)
Antes y después: el Palio gris → lleno de marcas ficticias y mensajes, con un barrido de cortina de garage en
medio. Toma real del carro de hoy + `PalioScene` lleno, con la misma cámara.
*Prompt:* "V16-AntesDespues": footage real → GarageDoor → `PalioScene` con las 12 piezas pintadas con marcas
ficticias y las salpicaderas con 40 mensajes; misma posición de cámara que la toma real (ajústala a mano con props
cameraPos/target).

### V17 · "El periódico" (15 s)
El periódico de la página ("Regio pone su carro a la venta… pero por pedazos") desdoblándose. Es ideal para
mandárselo a medios locales.
*Prompt:* "V17-Periodico": portar `News.tsx` de la página a Remotion (fold → band → unroll) con el sello "SE
VENDE"; voz de locutor de noticiero antiguo; termina con "proyectcar.com".

### V18 · "Ficha técnica: el Palio" (20 s)
Formato "carta de carro de videojuego": motor, año, kilometraje, color y "piezas a la venta: 12". Les encanta a los
del rubro.
*Prompt:* "V18-Ficha": tarjeta coleccionable de papel con `StatBars` (Potencia, Aguante, Estilo, Qué tan meme), con
brillo holográfico (gradiente que se mueve con el frame) y el Palio 3D girando arriba.

### V19 · "Carta para negocios" (45 s, también en 16:9)
Para **adjuntar en los correos** a negocios: qué es, precios, cómo funciona, vigencia de 6 meses, ejemplos de
cómo se ve una marca y contacto. Tono profesional pero con el arte del proyecto.
*Prompt:* "V19-Negocios": dos composiciones con el mismo contenido, `V19-Negocios-9x16` (1080x1920) y
`V19-Negocios-16x9` (1920x1080). Usa `useVideoConfig()` para acomodar el layout, sin `CTAEnd` de rayos y con
cierre de "contacto: [correo]". Usa solo marcas ficticias.
