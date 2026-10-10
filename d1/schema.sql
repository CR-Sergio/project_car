-- ============================================================
-- ESQUEMA DE BASE DE DATOS PARA CLOUDFLARE D1 (SQLite)
-- Proyecto: Proyect Car
-- ============================================================

-- 1. Tabla de Piezas de Marcas (12 piezas únicas)
CREATE TABLE IF NOT EXISTS sales (
  part_id TEXT PRIMARY KEY,
  brand TEXT NOT NULL,
  color TEXT NOT NULL,
  logo_url TEXT,
  email TEXT NOT NULL,
  link TEXT,
  status TEXT NOT NULL DEFAULT 'available', -- 'available' | 'reserved' | 'sold'
  reserved_until INTEGER,                   -- Unix timestamp (ms) hasta cuando dura el apartado (15 min)
  stripe_session_id TEXT,                   -- ID de la sesión de Stripe Checkout
  stripe_invoice_id TEXT,                   -- ID de la factura generada por Stripe Invoicing
  created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);

-- 2. Tabla de Mensajes de la Raza (salpicaderas)
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  part_id TEXT NOT NULL,                    -- 'fender_l' | 'fender_r'
  text TEXT NOT NULL,                       -- Mensaje (máx. 24 caracteres)
  name TEXT,                                -- Nombre de cortesía para el techo (opcional, máx. 20 caracteres)
  email TEXT NOT NULL,
  stripe_session_id TEXT,
  stripe_invoice_id TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);

-- Índices para optimizar búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(status);
CREATE INDEX IF NOT EXISTS idx_messages_part ON messages(part_id);
