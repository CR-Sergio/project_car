// Cloudflare Pages Function: POST /api/create-paypal-order
// Valida disponibilidad, aparta la pieza o registra el mensaje por 2 horas en D1 y genera el Folio con enlace de PayPal.Me

interface Env {
  DB?: D1Database;
  PAYPAL_ME_USER?: string;
}

// Precios oficiales del servidor en MXN (para nunca confiar en el cliente)
const SERVER_PRICES: Record<string, { name: string; price: number; kind?: 'messages' | 'names' }> = {
  'cofre':      { name: 'Cofre', price: 18000 },
  'parabrisas': { name: 'Franja del parabrisas', price: 13000 },
  'defensa-d':  { name: 'Defensa delantera', price: 8000 },
  'techo':      { name: 'Techo de la raza', price: 0, kind: 'names' },
  'puerta-di':  { name: 'Puerta delantera izquierda', price: 9500 },
  'puerta-ti':  { name: 'Puerta trasera izquierda', price: 10500 },
  'vidrio-ti':  { name: 'Ventana trasera izquierda', price: 7500 },
  'salpi-i':    { name: 'Salpicadera de mensajes (izq.)', price: 100, kind: 'messages' },
  'puerta-dd':  { name: 'Puerta delantera derecha', price: 9500 },
  'puerta-td':  { name: 'Puerta trasera derecha', price: 10500 },
  'vidrio-td':  { name: 'Ventana trasera derecha', price: 7500 },
  'salpi-d':    { name: 'Salpicadera de mensajes (der.)', price: 100, kind: 'messages' },
  'porton':     { name: 'Portón trasero', price: 12000 },
  'medallon':   { name: 'Medallón (vidrio trasero)', price: 12000 },
  'defensa-t':  { name: 'Defensa trasera', price: 8000 },
};

const USD_RATE = 18.5; // Tipo de cambio estimado para pagos en USD
const RESERVATION_MS = 2 * 60 * 60 * 1000; // 2 horas de apartado

/** Genera un folio seguro, limpio y legible (ej: PC-9K4B2M) */
function generateFolio(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const randomBytes = new Uint8Array(6);
  crypto.getRandomValues(randomBytes);
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[randomBytes[i] % chars.length];
  }
  return `PC-${code}`;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const body = await request.json() as {
      partId?: string;
      brand?: string;
      color?: string;
      email?: string;
      link?: string;
      logoUrl?: string;
      msg?: string;
      roofName?: string;
      cur?: 'MXN' | 'USD';
    };

    const {
      partId,
      brand = '',
      color = '#2f6fe0',
      email = '',
      link = '',
      logoUrl = '',
      msg = '',
      roofName = '',
      cur = 'MXN'
    } = body;

    if (!partId || !SERVER_PRICES[partId]) {
      return new Response(JSON.stringify({ error: 'Pieza no válida' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return new Response(JSON.stringify({ error: 'Correo electrónico no válido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const item = SERVER_PRICES[partId];
    if (item.kind === 'names') {
      return new Response(JSON.stringify({ error: 'El techo no está a la venta individual' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const isMessage = item.kind === 'messages';
    const now = Date.now();
    const expiresAt = now + RESERVATION_MS;
    const folio = generateFolio();

    const isUsd = cur === 'USD';
    const currency = isUsd ? 'USD' : 'MXN';
    const amount = isUsd
      ? Math.round(item.price / USD_RATE)
      : item.price;

    // 1. Verificación y persistencia atómica en D1 (si D1 está configurado)
    if (env.DB) {
      if (isMessage) {
        // Validar cupo de mensajes (máx 120 mensajes por salpicadera)
        const countRes = await env.DB.prepare(
          `SELECT COUNT(*) as count FROM messages WHERE part_id = ? AND status != 'rejected'`
        ).bind(partId).first<{ count: number }>();

        if (countRes && countRes.count >= 120) {
          return new Response(
            JSON.stringify({ error: 'Esta salpicadera ya alcanzó el límite de 120 mensajes' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }

        const msgId = crypto.randomUUID();
        await env.DB.prepare(
          `INSERT INTO messages (id, part_id, text, name, email, folio, price, currency, status, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`
        ).bind(
          msgId,
          partId,
          msg.trim(),
          roofName.trim() || null,
          email.trim(),
          folio,
          amount,
          currency,
          now
        ).run();
      } else {
        // Validar si la pieza de marca está vendida o reservada activamente
        const existing = await env.DB.prepare(
          `SELECT status, reserved_until FROM sales WHERE part_id = ?`
        ).bind(partId).first<{ status: string; reserved_until: number | null }>();

        if (existing) {
          if (existing.status === 'sold') {
            return new Response(
              JSON.stringify({ error: 'Esta pieza ya fue vendida y no está disponible' }),
              { status: 409, headers: { 'Content-Type': 'application/json' } }
            );
          }
          if (existing.status === 'reserved' && existing.reserved_until && existing.reserved_until > now) {
            const minutesLeft = Math.ceil((existing.reserved_until - now) / 60000);
            return new Response(
              JSON.stringify({
                error: `Esta pieza está apartada en proceso de pago. Si el comprador no completa su pago, quedará libre en ~${minutesLeft} minutos.`,
                reservedUntil: existing.reserved_until,
              }),
              { status: 409, headers: { 'Content-Type': 'application/json' } }
            );
          }
        }

        // Crear o renovar la reserva por 2 horas
        await env.DB.prepare(
          `INSERT INTO sales (part_id, brand, color, logo_url, email, link, folio, price, currency, status, reserved_until, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'reserved', ?, ?)
           ON CONFLICT(part_id) DO UPDATE SET
             brand = excluded.brand,
             color = excluded.color,
             logo_url = excluded.logo_url,
             email = excluded.email,
             link = excluded.link,
             folio = excluded.folio,
             price = excluded.price,
             currency = excluded.currency,
             status = 'reserved',
             reserved_until = excluded.reserved_until,
             created_at = excluded.created_at`
        ).bind(
          partId,
          brand.trim(),
          color,
          logoUrl.trim() || null,
          email.trim(),
          link.trim() || null,
          folio,
          amount,
          currency,
          expiresAt,
          now
        ).run();
      }
    }

    // 2. Construir la URL oficial de PayPal.Me
    const paypalUser = env.PAYPAL_ME_USER || 'ProyectCar';
    // Ejemplo: https://paypal.me/ProyectCar/18000MXN o /100MXN
    const paypalUrl = `https://paypal.me/${encodeURIComponent(paypalUser)}/${amount}${currency}`;

    return new Response(
      JSON.stringify({
        ok: true,
        folio,
        partId,
        partName: item.name,
        amount,
        currency,
        paypalUser,
        paypalUrl,
        expiresAt,
        isMessage,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message || 'Error interno al procesar orden de PayPal' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
