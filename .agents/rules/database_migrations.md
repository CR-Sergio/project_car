# Reglas de Migración y Esquemas en Cloudflare D1 (SQLite)

## 1. Idempotencia de Esquemas en SQLite
- `CREATE TABLE IF NOT EXISTS` **no actualiza** tablas ya existentes ni añade columnas nuevas.
- Si se añaden o modifican columnas en un esquema (`schema.sql`), nunca se debe asumir que volver a ejecutar el archivo aplicará los cambios sobre tablas preexistentes.

## 2. Estrategia Dual de Migración
- **Para entornos iniciales o desarrollo (sin datos reales)**:
  Proveer sentencias de reinicio explícito antes de la creación:
  ```sql
  DROP TABLE IF EXISTS messages;
  DROP TABLE IF EXISTS sales;
  ```
- **Para entornos con datos persistentes (producción o staging con datos)**:
  Proveer siempre sentencias atómicas de alteración:
  ```sql
  ALTER TABLE <table> ADD COLUMN <columna> <tipo> [DEFAULT <valor>];
  ```

## 3. Validación Previa a Creación de Índices
- Todo `CREATE INDEX` que referencie columnas recién agregadas debe ser precedido por la verificación o alteración de la tabla para garantizar que la columna existe en el catálogo SQLite antes de indexarla (`SQLITE_ERROR: no such column`).
