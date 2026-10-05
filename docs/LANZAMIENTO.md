# Lanzamiento: lista de lo que hay que tener en regla

Base práctica, no asesoría legal ni fiscal: revísala con un abogado y un contador antes de cobrar.
En el código ya está lo que vive en la página; esta lista es lo que tienes que hacer tú.

## 1. SAT (antes del primer cobro)

- [ ] Darte de alta (o actualizar tu RFC) como persona física en el **Régimen Simplificado de Confianza (RESICO)**, con una actividad de servicios de publicidad. Necesitas e.firma; se hace en línea en sat.gob.mx.
- [ ] Sacar tu **Constancia de Situación Fiscal** y tener a la mano tu certificado de sello digital (CSD) para facturar.
- [ ] Facturar (CFDI 4.0) desde el portal gratuito del SAT a quien la pida. El checkout ya recoge RFC, razón social, régimen, código postal y uso (G03).
- [ ] Declarar cada mes antes del día 17: ISR de RESICO (1% a 2.5% según lo cobrado en el mes) e IVA (16% cobrado menos el IVA de tus facturas de gastos: vinil, comisiones, contador).
- [ ] Pedir factura de todo lo que pagues (vinil, instalación, contador, dominio) para acreditar su IVA.

## 2. Textos legales en la página

- [ ] Llenar tus datos en `src/data/legal.ts` (nombre, RFC, domicilio, correo). Mientras falten, las páginas los marcan en amarillo.
- [ ] Revisar las condiciones del servicio en el mismo archivo: vigencia (12 meses), videos mínimos (6) y plazos para mandar el logo, instalar y cancelar.
- [ ] Pasarle `/terminos` y `/aviso-de-privacidad` a un abogado. Están escritos con base en la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (DOF 20/03/2025) y la Ley Federal de Protección al Consumidor.
- [ ] Tener un correo real de contacto que revises: por ahí llegan cancelaciones, facturas y derechos ARCO (plazo de respuesta: 20 días hábiles).

## 3. Pagos

- [ ] Abrir cuenta de Mercado Pago y/o Stripe a tu nombre y RFC.
- [ ] Crear un Payment Link por pieza **con el monto CON IVA** (precio × 1.16) y pegarlos en `src/data/parts.ts`; cambiar `PAY_MODE` a `'live'` en `src/data/config.ts`.
- [ ] Leer los términos de uso de cada pasarela: lo que vendes es un servicio de publicidad, no donaciones.
- [ ] Antes de lanzar, borrar las ventas de ejemplo (`EXAMPLE_SOLD` en `src/data/parts.ts`) y cambiar el pie de página de "página de prueba".
- [ ] Siguiente paso técnico: backend con webhook para marcar piezas vendidas, apartar la pieza mientras alguien paga y guardar los datos del checkout (hoy se pierden al recargar).

## 4. El carro en la calle

- [ ] Avisar a tu aseguradora que el carro va rotulado y se usa para publicidad; confirmar que la póliza sigue cubriendo.
- [ ] Vidrios: usar **vinil microperforado** en medallón y ventanas traseras. En el parabrisas, solo la franja superior. Confirmar con el Reglamento de Tránsito de Monterrey / Nuevo León.
- [ ] Preguntar en Desarrollo Urbano del municipio de Monterrey si la publicidad en un vehículo particular necesita permiso de anuncios.
- [ ] Cotizar el vinil con 2 o 3 talleres y ajustar `src/data/budget.ts` (precio por m², instalación, retiro). La meta se recalcula sola.

## 5. Contenido y redes

- [ ] Marcar cada video con pieza pagada como **promoción pagada** en YouTube, TikTok e Instagram.
- [ ] Revisar cada marca antes de rotularla (lista de marcas no aceptadas en `src/data/legal.ts`, `RESTRICTED`). Alcohol, medicamentos y suplementos necesitan permiso de publicidad de COFEPRIS; mejor no aceptarlos.
- [ ] Guardar la aprobación por escrito (correo) de cada diseño antes de imprimir.
- [ ] Opcional: registrar "Proyect Car" en el IMPI. Fiat y Palio son marcas de Stellantis: úsalas solo para describir tu carro.
- [ ] Cambiar la foto de la portada (`public/img/palio-foto.webp`) por una foto tuya: la actual parece foto oficial de Fiat.
