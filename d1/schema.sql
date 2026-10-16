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
  folio TEXT,                               -- Folio único de compra (ej. PC-A4B7C9)
  price INTEGER DEFAULT 0,                  -- Monto oficial acordado en la orden
  currency TEXT DEFAULT 'MXN',              -- Divisa ('MXN' | 'USD')
  status TEXT NOT NULL DEFAULT 'available', -- 'available' | 'reserved' | 'sold'
  reserved_until INTEGER,                   -- Unix timestamp (ms) duración de apartado (2 horas)
  created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);

-- 2. Tabla de Mensajes de la Raza (salpicaderas)
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  part_id TEXT NOT NULL,                    -- 'salpi-i' | 'salpi-d'
  text TEXT NOT NULL,                       -- Mensaje (máx. 24 caracteres)
  name TEXT,                                -- Nombre de cortesía para el techo (opcional, máx. 20 caracteres)
  email TEXT NOT NULL,
  folio TEXT,                               -- Folio único de compra (ej. PC-M7K2X1)
  price INTEGER DEFAULT 100,
  currency TEXT DEFAULT 'MXN',
  status TEXT NOT NULL DEFAULT 'approved',  -- 'pending' | 'approved' | 'rejected'
  created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);

-- Índices para optimizar búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(status);
CREATE INDEX IF NOT EXISTS idx_sales_folio ON sales(folio);
CREATE INDEX IF NOT EXISTS idx_messages_part ON messages(part_id);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
CREATE INDEX IF NOT EXISTS idx_messages_folio ON messages(folio);
