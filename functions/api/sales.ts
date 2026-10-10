// Cloudflare Pages Function: GET /api/sales
// Consulta las piezas vendidas, apartados temporales y mensajes en Cloudflare D1

interface Env {
  DB?: D1Database;
}

interface SaleRow {
  part_id: string;
  brand: string;
  color: string;
  logo_url: string | null;
  link: string | null;
  status: string;
  reserved_until: number | null;
}

interface MessageRow {
  id: string;
  part_id: string;
  text: string;
  name: string | null;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env } = context;

  // Si aún no está vinculado D1, retornar respuesta vacía sin tronar
  if (!env.DB) {
    return new Response(
      JSON.stringify({
        sold: {},
        reserved: {},
        wall: { byPart: {}, names: [] },
        warning: 'D1 database binding (DB) not configured yet in Cloudflare Pages'
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }

  try {
    const now = Date.now();

    // 1. Obtener todas las piezas que no estén en available
    const salesQuery = await env.DB.prepare(
      `SELECT part_id, brand, color, logo_url, link, status, reserved_until FROM sales WHERE status IN ('sold', 'reserved')`
    ).all<SaleRow>();

    const sold: Record<string, { brand: string; color: string; link?: string; img?: string }> = {};
    const reserved: Record<string, { expiresAt: number }> = {};

    for (const row of salesQuery.results || []) {
      if (row.status === 'sold') {
        sold[row.part_id] = {
          brand: row.brand,
          color: row.color,
          link: row.link || undefined,
          img: row.logo_url || undefined,
        };
      } else if (row.status === 'reserved' && row.reserved_until && row.reserved_until > now) {
        reserved[row.part_id] = {
          expiresAt: row.reserved_until,
        };
      }
    }

    // 2. Obtener mensajes de las salpicaderas y nombres del techo
    const messagesQuery = await env.DB.prepare(
      `SELECT id, part_id, text, name FROM messages ORDER BY created_at ASC`
    ).all<MessageRow>();

    const byPart: Record<string, string[]> = {
      fender_l: [],
      fender_r: [],
    };
    const names: string[] = [];

    for (const msg of messagesQuery.results || []) {
      if (!byPart[msg.part_id]) {
        byPart[msg.part_id] = [];
      }
      byPart[msg.part_id].push(msg.text);
      if (msg.name && msg.name.trim()) {
        names.push(msg.name.trim());
      }
    }

    return new Response(
      JSON.stringify({
        sold,
        reserved,
        wall: { byPart, names },
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=5, s-maxage=5',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: 'Error al consultar ventas', details: err?.message || String(err) }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      }
    );
  }
};
