# Plan de Implementación: Pagos en Línea, Recibos y Base de Datos D1

## Goal Description
Implementar un sistema de compras en línea seguro, sencillo y automatizado para el proyecto **Proyect Car**, desplegado íntegramente sobre el ecosistema de **Cloudflare** (**Cloudflare Pages**, **Pages Functions** y **Cloudflare D1** como base de datos SQL serverless nativa), utilizando **Stripe Checkout** para procesar pagos (tarjetas de crédito/débito, Apple Pay, Google Pay, OXXO) y enviar recibos digitales automáticos a los compradores.

El sistema contempla:
1. **Creación de Base de Datos Nativa (Cloudflare D1)**: Sin necesidad de contratar o registrar servicios externos. D1 se crea con 1 clic en el panel de Cloudflare o por CLI y se vincula directamente a Cloudflare Pages sin latencia de red.
2. **Venta de 12 piezas publicitarias únicas para marcas**: Bloqueo temporal por 15 minutos al iniciar el checkout para evitar ventas duplicadas, confirmación final vía Webhook firmado y actualización visual inmediata del auto en 3D.
3. **Venta de Mensajes de la Raza ($100 MXN)**: Registro del mensaje (máx. 24 caracteres) y nombre de cortesía para el techo (máx. 20 caracteres), con validación de límite de cupo (120 por salpicadera).
4. **Comprobantes y recibos automáticos**: Configuración de Stripe Receipts para enviar confirmación detallada por email con desglose y folio sin requerir facturación fiscal CFDI 4.0 del SAT.
5. **Diagnóstico de cumplimiento de protocolos**: Evaluación y plan de remediación técnica, legal y de seguridad.

---

## Diagnóstico: Cumplimiento de Protocolos y Normativas

A continuación se detalla si el proyecto cumple actualmente con los protocolos requeridos y qué acciones exactas se necesitan para estar al 100%:

| Protocolo / Normativa | Estado Actual | Diagnóstico y Acciones Necesarias |
|---|---|---|
| **PCI-DSS (Seguridad de Tarjetas Bancarias)** | 🟡 Parcial (Simulado) | Al usar **Stripe Checkout** (página alojada y certificada por Stripe), el proyecto califica para el nivel de cumplimiento más sencillo y seguro: **SAQ A**. Los datos de tarjeta jamás tocan tu código ni tus servidores. Cumplimiento 100% garantizado al delegar en Stripe. |
| **Cifrado y Transporte (HTTPS / TLS 1.3)** | 🟢 Cumple | Cloudflare Pages provee automáticamente certificados SSL/TLS con cifrado estricto y protección contra ataques DDoS y bots. |
| **Integridad de Webhooks (Firma Criptográfica)** | 🔴 Falta backend | Las Cloudflare Pages Functions verificarán la firma del encabezado `stripe-signature` con `STRIPE_WEBHOOK_SECRET` para asegurar que ninguna orden pueda ser falsificada externamente. |
| **Prevención de Doble Venta (Concurrencia)** | 🔴 Falta backend | Actualmente dos personas podrían comprar la misma pieza si abren el enlace al mismo tiempo. Se resuelve con reservas atómicas en Cloudflare D1 con vigencia de 15 minutos (`reserved_until`). |
| **Protección de Datos Personales (LFPDPPP - México)** | 🟡 Pendiente de datos | El sitio ya cuenta con `/aviso-de-privacidad` y `/terminos`, pero en `src/data/legal.ts` faltan los datos reales del responsable (`[TU NOMBRE]`, `[DOMICILIO]`, `[CORREO]`, `[RFC]`). Es obligatorio rellenarlos antes de procesar compras reales. |
| **Protección al Consumidor (LFPC / PROFECO)** | 🟢 Estructura lista | El checkout ya cuenta con casillas obligatorias de aceptación de términos, aviso de venta final sin reembolsos (por ser servicio de rotulación y diseño a la medida) y desglose de precio total en MXN. |
| **Emisión de Recibos / Comprobantes** | 🟢 Resuelto por Stripe | Stripe envía automáticamente un recibo con fecha, ID de transacción, desglose y concepto del servicio al email proporcionado por el comprador. |

---

## User Review Required

> [!IMPORTANT]
> **Creación de Cloudflare D1 y vinculación con Pages:**
> Como actualmente **no hay base de datos**, utilizaremos **Cloudflare D1**.
> - En el panel de Cloudflare (sección *Workers & Pages* > *D1*), creas una base de datos llamada `proyect_car_db` (o con el comando `npx wrangler d1 create proyect_car_db`).
> - En la configuración de tu proyecto de Cloudflare Pages, agregas el D1 database binding con el nombre `DB`.
> - Ejecutas el script SQL `d1/schema.sql` (provisto en este plan) directamente en la consola de D1 de Cloudflare.

> [!NOTE]
> **Credenciales de Stripe:**
> Se configurarán como variables de entorno privadas en Cloudflare Pages:
> - `STRIPE_SECRET_KEY`: Tu clave secreta de Stripe (`sk_test_...` o `sk_live_...`).
> - `STRIPE_WEBHOOK_SECRET`: El secreto del endpoint de webhook (`whsec_...`).

> [!WARNING]
> **Datos Legales Obligatorios:**
> Antes de lanzar a cobro real, se deben reemplazar los corchetes en `src/data/legal.ts` con tus datos de contacto reales para que el Aviso de Privacidad y los Términos tengan validez legal en México.

---

## Proposed Changes

```
project_car/
├── d1/
│   └── schema.sql                      [NEW] -> Estructura DDL para Cloudflare D1
├── functions/
│   └── api/
│       ├── create-checkout-session.ts  [NEW] -> Creación de sesión Stripe + bloqueo 15 min en D1
│       ├── webhook.ts                  [NEW] -> Confirmación de pago / liberación de reserva en D1
│       └── sales.ts                    [NEW] -> Consulta de piezas vendidas/reservadas y mensajes
├── src/
│   ├── data/
│   │   └── config.ts                   [MODIFY] -> URLs de API y switch de modo live/test
│   ├── state/
│   │   └── sales.tsx                   [MODIFY] -> Consulta y sincronización con /api/sales
│   └── pages/garage/
│       └── CheckoutModal.tsx           [MODIFY] -> Integración con /api/create-checkout-session
```

---

### 1. Base de Datos D1 (Cloudflare D1)

#### [NEW] `d1/schema.sql`
- Script SQL compatible con SQLite / Cloudflare D1:
```sql
-- Tabla para las 12 piezas de marcas
CREATE TABLE IF NOT EXISTS sales (
  part_id TEXT PRIMARY KEY,
  brand TEXT NOT NULL,
  color TEXT NOT NULL,
  logo_url TEXT,
  email TEXT NOT NULL,
  link TEXT,
  status TEXT NOT NULL DEFAULT 'available', -- 'available' | 'reserved' | 'sold'
  reserved_until INTEGER, -- Unix timestamp en milisegundos
  stripe_session_id TEXT,
  stripe_invoice_id TEXT, -- ID de la factura generada por Stripe Invoicing
  created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);

-- Tabla para los mensajes de la raza (salpicaderas)
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  part_id TEXT NOT NULL, -- 'fender_l' | 'fender_r'
  text TEXT NOT NULL,
  name TEXT, -- Nombre de cortesía para el techo
  email TEXT NOT NULL,
  stripe_session_id TEXT,
  stripe_invoice_id TEXT, -- ID de la factura generada por Stripe Invoicing
  created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);

CREATE INDEX IF NOT EXISTS idx_messages_part ON messages(part_id);
```

---

### 2. Backend Serverless en Cloudflare Pages Functions

#### [NEW] `functions/api/create-checkout-session.ts`
- Recibe `POST /api/create-checkout-session` con el payload de compra:
  - Para pieza de marca: `partId`, `brand`, `color`, `email`, `link`, etc.
  - Para mensaje: `partId`, `msg`, `roofName`, `email`, etc.
- Consulta `env.DB` (D1):
  - Si es pieza única: verifica que no esté `status = 'sold'` ni `status = 'reserved'` con `reserved_until > Date.now()`.
  - Si está reservada pero ya pasaron los 15 minutos, la reserva se considera expirada y se permite la nueva compra.
  - Inserta o actualiza la fila con `status = 'reserved'` y `reserved_until = Date.now() + 15 * 60 * 1000`.
  - Si es mensaje: cuenta cuántos mensajes existen en `messages` para esa salpicadera. Si `>= 120`, rechaza por cupo lleno.
- Invoca la API de Stripe Checkout para crear una sesión:
  - `payment_method_types: ['card', 'oxxo']` (en MXN)
  - `customer_email: email` y `customer_creation: 'always'`
  - `automatic_tax: { enabled: true }` y `billing_address_collection: 'required'`
  - `tax_id_collection: { enabled: true }` (soporte de RFC en México / Tax ID internacional)
  - `invoice_creation: { enabled: true }` con descripción del concepto
  - `tax_behavior: 'inclusive'` en line items
  - `Idempotency-Key` en encabezados para garantizar resiliencia en reintentos
  - `metadata`: `partId`, `kind`, `brand`, `text`, `roofName`, etc.
  - Retorna `{ checkoutUrl }` al frontend.

#### [NEW] `functions/api/webhook.ts`
- Recibe `POST /api/webhook` con la notificación de Stripe.
- Valida la firma `stripe-signature` usando `STRIPE_WEBHOOK_SECRET` y Web Crypto nativo de Cloudflare.
- Procesa el evento `checkout.session.completed`:
  - Si `kind === 'part'`: actualiza en `sales` `status = 'sold'`, confirmando los datos finales del comprador.
  - Si `kind === 'messages'`: inserta en `messages` el mensaje y el nombre de cortesía para el techo.
- Procesa el evento `checkout.session.expired`:
  - Si la sesión expira sin pago, actualiza en `sales` `status = 'available'` para liberar inmediatamente la pieza.

#### [NEW] `functions/api/sales.ts`
- Recibe `GET /api/sales`.
- Consulta en `env.DB`:
  - Piezas vendidas (`status = 'sold'`).
  - Piezas temporalmente reservadas activas (`status = 'reserved' AND reserved_until > ?`).
  - Lista de mensajes agrupados por salpicadera y nombres del techo.
- Retorna el JSON consolidado con encabezados `Cache-Control: public, max-age=10, s-maxage=10` para alta velocidad en el CDN de Cloudflare.

---

### 3. Frontend y Sincronización en Tiempo Real

#### [MODIFY] `src/state/sales.tsx`
- Al montar, realiza `fetch('/api/sales')` para cargar las ventas reales desde Cloudflare D1.
- Mantiene polling ligero cada 30 segundos para reflejar piezas vendidas o apartadas.
- Si está en desarrollo local o `PAY_MODE === 'test'`, permite el funcionamiento simulado tradicional.

#### [MODIFY] `src/pages/garage/CheckoutModal.tsx`
- En modo `'live'`, envía la solicitud a `/api/create-checkout-session`.
- Si la pieza está reservada por otro usuario, muestra aviso: *"Esta pieza está en proceso de pago por otra persona. Si no completa su compra en unos minutos, quedará libre."*
- Redirige de inmediato a Stripe Checkout.

---

## Verification Plan

### Automated Tests
```bash
npm run typecheck
npm run build
npm test
```

### Manual Verification
1. **Configuración de D1 en local**:
   - Ejecutar la creación de esquema con `npx wrangler d1 execute proyect_car_db --file=./d1/schema.sql` (o en Cloudflare Dashboard).
2. **Prueba de Checkout & Bloqueo (15 min)**:
   - Iniciar checkout para "Cofre". Verificar que en `sales` queda en `status = 'reserved'`.
   - Intentar iniciar checkout para la misma pieza desde una ventana de incógnito; confirmar que el sistema avisa que está apartada.
3. **Prueba de Webhook de Stripe**:
   - Enviar evento de pago exitoso y confirmar que la pieza pasa a `sold` y se pinta con el logo/marca en el visualizador 3D.
4. **Prueba de Recibo**:
   - Verificar la recepción del email de confirmación y recibo de Stripe.
