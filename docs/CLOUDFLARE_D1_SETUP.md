# Guía de Configuración de Base de Datos: Cloudflare D1

Esta guía detalla los pasos para crear, configurar y vincular la base de datos **Cloudflare D1** (SQLite serverless) utilizada por el backend en **Cloudflare Pages Functions** de **Proyect Car**.

---

## 1. Arquitectura y Componentes de Datos

El backend serverless (`/functions/api/`) requiere una base de datos D1 para gestionar:
1. **Piezas de Marcas (`sales`)**: Guarda el estado de las 12 piezas (`available`, `reserved`, `sold`), apartado temporal atómico de 15 minutos, logos y enlaces de patrocinadores.
2. **Mensajes Comunitarios (`messages`)**: Guarda los textos de las salpicaderas y nombres para el techo.
3. **Índices de Búsqueda**: Optimización de lecturas para `/api/sales`.

El esquema SQL oficial se encuentra en [`d1/schema.sql`](file:///home/butzmann/.gemini/antigravity-ide/scratch/Project-car/project_car/d1/schema.sql).

---

## 2. Opción A: Configuración desde el Panel Web de Cloudflare (Recomendada)

No requiere instalar herramientas locales ni configurar tokens de API:

### Paso 1: Crear la Base de Datos D1
1. Inicia sesión en el [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. En el menú lateral izquierdo, ve a **Workers & Pages** > **D1 SQL Database**.
3. Haz clic en **Create Database** (Crear base de datos).
4. Asigna el nombre: `proyect_car_db` (o el de tu preferencia).
5. Selecciona la ubicación/región más cercana (ej. North America / Automático) y confirma.

### Paso 2: Ejecutar el Esquema SQL
> [!TIP]
> **Nota sobre la Consola Web de Cloudflare:**
> La consola web de Cloudflare D1 a veces ejecuta únicamente la consulta donde está el cursor o tiene dificultades procesando múltiples sentencias juntas en un solo clic (lo que puede causar el error `no such table: main.messages`). Se recomienda ejecutar los bloques **uno por uno** en el siguiente orden:

1. Dentro del panel de D1, entra a la base de datos recién creada (`proyect_car_db`).
2. Ve a la pestaña **Console** (Consola SQL).
3. Ejecuta cada bloque por separado:

**Bloque 1: Crear tabla `sales`**
```sql
CREATE TABLE IF NOT EXISTS sales (
  part_id TEXT PRIMARY KEY,
  brand TEXT NOT NULL,
  color TEXT NOT NULL,
  logo_url TEXT,
  email TEXT NOT NULL,
  link TEXT,
  status TEXT NOT NULL DEFAULT 'available',
  reserved_until INTEGER,
  stripe_session_id TEXT,
  stripe_invoice_id TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);
```

**Bloque 2: Crear tabla `messages`**
```sql
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  part_id TEXT NOT NULL,
  text TEXT NOT NULL,
  name TEXT,
  email TEXT NOT NULL,
  stripe_session_id TEXT,
  stripe_invoice_id TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);
```

**Bloque 3: Crear los índices**
```sql
CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(status);
CREATE INDEX IF NOT EXISTS idx_messages_part ON messages(part_id);
```

4. Para verificar que todo quedó creado correctamente, ejecuta:
```sql
SELECT name FROM sqlite_master WHERE type='table';
```
Debe listar tanto `sales` como `messages`.

### Paso 3: Vincular la Base de Datos a Cloudflare Pages (Binding `DB`)
Las Pages Functions en `/functions/api/` acceden a la base de datos a través de la variable `env.DB`:
1. En el panel de Cloudflare, ve a **Workers & Pages** y selecciona tu proyecto de Pages (**proyect-car**).
2. Ve a **Settings** > **Functions**.
3. Desplázate hasta la sección **D1 database bindings** y haz clic en **Add binding**.
4. Llena los campos:
   - **Variable name**: `DB` *(Debe ser exactamente `DB` en mayúsculas)*.
   - **D1 database**: Selecciona `proyect_car_db`.
5. Repite el binding tanto para el entorno de **Production** como de **Preview** si deseas probar ramas antes de producción.
6. Haz clic en **Save**.
7. Si el sitio ya tenía un despliegue activo, realiza un nuevo despliegue (o haz clic en *Redeploy* en el último deployment) para que las Functions tomen el nuevo binding.

---

## 3. Opción B: Configuración mediante Docker y Wrangler CLI

Siguiendo la política de no instalar dependencias en el sistema operativo anfitrión, puedes ejecutar **Wrangler** dentro de un contenedor Docker temporal:

### Paso 1: Crear la base de datos
```bash
docker run --rm -it \
  -v "$(pwd)":/app \
  -w /app \
  -e CLOUDFLARE_API_TOKEN="<TU_CLOUDFLARE_API_TOKEN>" \
  -e CLOUDFLARE_ACCOUNT_ID="<TU_ACCOUNT_ID>" \
  node:20-alpine \
  npx wrangler d1 create proyect_car_db
```

Este comando devolverá el `database_id` asignado por Cloudflare.

### Paso 2: Aplicar las migraciones / esquema SQL
Para ejecutar el script SQL contra la base de datos remota en producción:
```bash
docker run --rm -it \
  -v "$(pwd)":/app \
  -w /app \
  -e CLOUDFLARE_API_TOKEN="<TU_CLOUDFLARE_API_TOKEN>" \
  -e CLOUDFLARE_ACCOUNT_ID="<TU_ACCOUNT_ID>" \
  node:20-alpine \
  npx wrangler d1 execute proyect_car_db --remote --file=./d1/schema.sql
```

---

## 4. Configuración para Desarrollo y Pruebas Locales (Docker)

Para simular localmente Cloudflare Pages Functions junto con la base de datos D1 local:

```bash
docker run --rm -it \
  -p 8788:8788 \
  -v "$(pwd)":/app \
  -w /app \
  node:20-alpine \
  npx wrangler pages dev dist --d1=DB=proyect_car_db --ip 0.0.0.0 --port 8788
```

Wrangler creará automáticamente una base de datos SQLite local simulada en `.wrangler/state/v3/d1` sin tocar la base de datos de producción.

---

## 5. Recursos Adicionales Necesarios (R2 y Variables de Entorno)

Para que el backend funcione completamente junto a la base de datos D1:

1. **Bucket R2 para Logos (`BUCKET`)**:
   - Crear bucket en Cloudflare: `proyect-car-assets`.
   - En Cloudflare Pages > **Settings** > **Functions** > **R2 bucket bindings**:
     - Variable name: `BUCKET`
     - R2 bucket: `proyect-car-assets`
2. **Variables de Entorno (Stripe)**:
   - `STRIPE_SECRET_KEY`: Llave secreta de Stripe (`sk_live_...` o `sk_test_...`).
   - `STRIPE_WEBHOOK_SECRET`: Secreto del webhook (`whsec_...`).
   - `SITE_URL`: URL oficial del dominio (ej. `https://proyectcar.com`).

---

## 6. Monitoreo y Verificación

Una vez configurado el binding `DB`:
- Realiza una petición `GET https://tudominio.com/api/sales`.
- Si el binding está activo, responderá con el objeto JSON:
  ```json
  {
    "sold": {},
    "reserved": {},
    "wall": { "byPart": { "fender_l": [], "fender_r": [] }, "names": [] }
  }
  ```
- Si falta el binding, el endpoint devolverá una advertencia segura (`warning: 'D1 database binding (DB) not configured yet'`) sin romper el sitio frontend.
