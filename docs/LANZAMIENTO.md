# Lanzamiento: lista de lo que hay que tener en regla

Base práctica, no asesoría legal ni fiscal: revísala con un abogado y un contador antes de cobrar.
En el código ya está lo que vive en la página; esta lista es lo que tienes que hacer tú.

## 1. Impuestos (decisión pendiente)

La página ya **no habla de IVA ni de factura**: los precios son finales. Aun así, lo que cobres es un ingreso:

- [ ] Platica con un contador antes de cobrar. Mercado Pago y Stripe reportan al SAT lo que recibes, y sin RFC no puedes acreditar gastos ni dar factura.
- [ ] Si más adelante te das de alta en RESICO (en línea, con e.firma), puedes facturar gratis desde el portal del SAT. Muchas empresas solo compran publicidad con factura: eso puede destrabar ventas.
- [ ] Si te das de alta, revisa con el contador si el IVA queda incluido en los precios actuales.

### Números internos (no se muestran en la página)

Meta pública: **$150,000 MXN**. Precios de las 15 piezas: suman $159,000.

| Concepto | Estimado |
|---|---|
| Vinil impreso + laminado (≈$900/m²) o microperforado en vidrios (≈$750/m²), +15% merma, instalación y retiro | ≈ $17,550 |
| Comisión de pasarela (≈3.6% + $3 por pago) | ≈ $5,450 sobre $150,000 |
| **Te quedaría para el carro, vendiendo $150,000** | **≈ $127,000** antes de impuestos |

Vinil por pieza: cofre $2,450 · techo $2,550 · franja del parabrisas $750 · defensas $900 c/u · puertas delanteras $1,050 c/u ·
puertas traseras (con costado) $1,300 c/u · ventanas traseras $750 c/u · salpicaderas $950 c/u · portón $1,050 · medallón $850.
Cotiza con 2 o 3 talleres para confirmarlo.

## 2. Textos legales en la página

- [ ] Llenar tus datos en `src/data/legal.ts` (nombre, RFC, domicilio, correo). Mientras falten, las páginas los marcan en amarillo.
- [ ] Revisar las condiciones del servicio en el mismo archivo: vigencia (6 meses), videos mínimos (3) y plazos para logo, diseño, aprobación e instalación. **No subas `diasDiseno` de 10 días hábiles**: es lo que sostiene la política de ventas finales frente al derecho de revocación de 5 días (art. 56 LFPC, que no aplica a servicios que se prestan dentro de 10 días hábiles).
- [ ] Domicilio: puede ser una oficina o un domicilio para notificaciones; no tiene que ser tu casa.
- [ ] Pasarle `/terminos` y `/aviso-de-privacidad` a un abogado. Están escritos con base en la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (DOF 20/03/2025) y la Ley Federal de Protección al Consumidor.
- [ ] Tener un correo real de contacto que revises: por ahí llegan logos, aclaraciones, contracargos y derechos ARCO (plazo de respuesta: 20 días hábiles).
- [ ] Guardar por cada venta la evidencia: fecha y hora de aceptación de términos y de la política de ventas finales, correos con el logo y la aprobación del diseño, y fotos de la instalación. Es lo que te defiende en un contracargo.

## 3. Pagos

- [ ] Abrir cuenta de Mercado Pago y/o Stripe a tu nombre y RFC.
- [ ] Crear un Payment Link por pieza por su precio y pegarlos en `src/data/parts.ts`; cambiar `PAY_MODE` a `'live'` en `src/data/config.ts`.
- [ ] En la descripción de cada link (o en el recibo de la pasarela), poner "Servicio de publicidad · venta final, sin reembolsos · ver términos en proyectcar.com/terminos".
- [ ] Leer los términos de uso de cada pasarela: lo que vendes es un servicio de publicidad, no donaciones.
- [ ] Antes de lanzar, borrar las ventas de ejemplo (`EXAMPLE_SOLD` en `src/data/parts.ts`) y cambiar el pie de página de "página de prueba".
- [ ] Siguiente paso técnico: backend con webhook para marcar piezas vendidas, apartar la pieza mientras alguien paga y guardar los datos del checkout (hoy se pierden al recargar).

## 4. El carro en la calle

- [ ] Avisar a tu aseguradora que el carro va rotulado y se usa para publicidad; confirmar que la póliza sigue cubriendo.
- [ ] Vidrios: usar **vinil microperforado** en medallón y ventanas traseras. En el parabrisas, solo la franja superior. Confirmar con el Reglamento de Tránsito de Monterrey / Nuevo León.
- [ ] Preguntar en Desarrollo Urbano del municipio de Monterrey si la publicidad en un vehículo particular necesita permiso de anuncios.

## 5. Contenido y redes

- [ ] Marcar cada video con pieza pagada como **promoción pagada** en YouTube, TikTok e Instagram.
- [ ] Revisar cada marca antes de rotularla (lista de marcas no aceptadas en `src/data/legal.ts`, `RESTRICTED`). Alcohol, medicamentos y suplementos necesitan permiso de publicidad de COFEPRIS; mejor no aceptarlos.
- [ ] Guardar la aprobación por escrito (correo) de cada diseño antes de imprimir.
- [ ] Opcional: registrar "Proyect Car" en el IMPI. Fiat y Palio son marcas de Stellantis: úsalas solo para describir tu carro.
- [ ] Cambiar la foto de la portada (`public/img/palio-foto.webp`) por una foto tuya: la actual parece foto oficial de Fiat.
