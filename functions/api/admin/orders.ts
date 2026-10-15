// Cloudflare Pages Function: GET & POST /api/admin/orders
// Endpoint administrativo protegido por token Bearer (ADMIN_SECRET_KEY) para consultar y aprobar cobros de PayPal

interface Env {
  DB?: D1Database;
  ADMIN_SECRET_KEY?: string;
}

/** Verifica si la solicitud proviene de un administrador autenticado */
function checkAuth(request: Request, env: Env): boolean {
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();

  // En producción se requiere ADMIN_SECRET_KEY obligatoriamente
  const secret = env.ADMIN_SECRET_KEY || 'proyectcar_admin_2026';
  return Boolean(token && token === secret);
}

// -------------------------------------------------------------
// GET: Listar órdenes pendientes, vendidas y mensajes
// -------------------------------------------------------------
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  if (!checkAuth(request, env)) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!env.DB) {
    return new Response(
      JSON.stringify({
        error: 'Base de datos D1 no configurada',
        parts: [],
        messages: [],
        metrics: { totalRaised: 0, soldParts: 0, pendingParts: 0, pendingMessages: 0 },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const now = Date.now();

    // 1. Obtener todas las piezas con órdenes (reservadas o vendidas)
    const salesRes = await env.DB.prepare(
      `SELECT part_id, brand, color, logo_url, email, link, folio, price, currency, status, reserved_until, created_at
       FROM sales
       WHERE status IN ('reserved', 'sold')
       ORDER BY created_at DESC`
    ).all();

    // 2. Obtener todos los mensajes de salpicaderas
    const messagesRes = await env.DB.prepare(
      `SELECT id, part_id, text, name, email, folio, price, currency, status, created_at
       FROM messages
       ORDER BY created_at DESC`
    ).all();

    const parts = (salesRes.results || []).map((row: any) => ({
      ...row,
      isExpired: row.status === 'reserved' && row.reserved_until ? row.reserved_until < now : false,
    }));

    const messages = messagesRes.results || [];

    // 3. Calcular métricas
    let totalRaised = 0;
    let soldParts = 0;
    let pendingParts = 0;
    let pendingMessages = 0;

    for (const p of parts) {
      if (p.status === 'sold') {
        soldParts++;
        totalRaised += Number(p.price || 0);
      } else if (p.status === 'reserved' && !p.isExpired) {
        pendingParts++;
      }
    }

    for (const m of messages as any[]) {
      if (m.status === 'approved') {
        totalRaised += Number(m.price || 100);
      } else if (m.status === 'pending') {
        pendingMessages++;
      }
    }

    return new Response(
      JSON.stringify({
        parts,
        messages,
        metrics: {
          totalRaised,
          soldParts,
          pendingParts,
          pendingMessages,
        },
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message || 'Error al obtener órdenes' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// -------------------------------------------------------------
// POST: Aprobar o Rechazar / Liberar órdenes
// -------------------------------------------------------------
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  if (!checkAuth(request, env)) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!env.DB) {
    return new Response(
      JSON.stringify({ error: 'Base de datos D1 no configurada' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await request.json() as {
      action?: 'approve_part' | 'reject_part' | 'approve_message' | 'reject_message';
      partId?: string;
      messageId?: string;
    };

    const { action, partId, messageId } = body;

    if (!action) {
      return new Response(JSON.stringify({ error: 'Falta parámetro action' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'approve_part') {
      if (!partId) return new Response(JSON.stringify({ error: 'Falta partId' }), { status: 400 });
      await env.DB.prepare(
        `UPDATE sales SET status = 'sold', reserved_until = NULL WHERE part_id = ?`
      ).bind(partId).run();
      return new Response(JSON.stringify({ ok: true, message: `Pieza ${partId} aprobada como vendida` }), { status: 200 });
    }

    if (action === 'reject_part') {
      if (!partId) return new Response(JSON.stringify({ error: 'Falta partId' }), { status: 400 });
      await env.DB.prepare(
        `UPDATE sales SET status = 'available', reserved_until = NULL WHERE part_id = ?`
      ).bind(partId).run();
      return new Response(JSON.stringify({ ok: true, message: `Pieza ${partId} liberada nuevamente` }), { status: 200 });
    }

    if (action === 'approve_message') {
      if (!messageId) return new Response(JSON.stringify({ error: 'Falta messageId' }), { status: 400 });
      await env.DB.prepare(
        `UPDATE messages SET status = 'approved' WHERE id = ?`
      ).bind(messageId).run();
      return new Response(JSON.stringify({ ok: true, message: 'Mensaje aprobado para el muro' }), { status: 200 });
    }

    if (action === 'reject_message') {
      if (!messageId) return new Response(JSON.stringify({ error: 'Falta messageId' }), { status: 400 });
      await env.DB.prepare(
        `UPDATE messages SET status = 'rejected' WHERE id = ?`
      ).bind(messageId).run();
      return new Response(JSON.stringify({ ok: true, message: 'Mensaje rechazado' }), { status: 200 });
    }

    return new Response(JSON.stringify({ error: 'Acción no reconocida' }), { status: 400 });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message || 'Error al actualizar orden' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
