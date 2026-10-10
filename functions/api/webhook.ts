// Cloudflare Pages Function: POST /api/webhook
// Recibe las notificaciones de Stripe, valida la firma criptográfica y actualiza Cloudflare D1

interface Env {
  DB?: D1Database;
  STRIPE_WEBHOOK_SECRET?: string;
}

/** Valida la firma HMAC-SHA256 de Stripe usando la Web Crypto API nativa de Cloudflare */
async function verifyStripeSignature(rawBody: string, sigHeader: string, secret: string): Promise<boolean> {
  const parts = sigHeader.split(',').reduce<Record<string, string[]>>((acc, item) => {
    const [k, v] = item.split('=');
    if (k && v) {
      if (!acc[k]) acc[k] = [];
      acc[k].push(v);
    }
    return acc;
  }, {});

  const timestamp = parts['t']?.[0];
  const signatures = parts['v1'] || [];

  if (!timestamp || signatures.length === 0) return false;

  // Tolerancia de 5 minutos (300 segundos) para prevenir ataques de repetición (replay attacks)
  const timeDiff = Math.abs(Date.now() / 1000 - parseInt(timestamp, 10));
  if (isNaN(timeDiff) || timeDiff > 300) return false;

  const encoder = new TextEncoder();
  const payloadToSign = encoder.encode(`${timestamp}.${rawBody}`);
  const keyData = encoder.encode(secret);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, payloadToSign);
  const expectedSig = Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return signatures.some(sig => sig === expectedSig);
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  const sigHeader = request.headers.get('stripe-signature');
  if (!sigHeader) {
    return new Response(JSON.stringify({ error: 'Falta encabezado stripe-signature' }), { status: 400 });
  }

  const rawBody = await request.text();

  // 1. Verificación de firma criptográfica
  if (env.STRIPE_WEBHOOK_SECRET) {
    const isValid = await verifyStripeSignature(rawBody, sigHeader, env.STRIPE_WEBHOOK_SECRET);
    if (!isValid) {
      return new Response(JSON.stringify({ error: 'Firma de webhook inválida' }), { status: 401 });
    }
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch (err) {
    return new Response(JSON.stringify({ error: 'JSON inválido' }), { status: 400 });
  }

  if (!env.DB) {
    // Si aún no está vinculado D1, aceptar el evento pero advertir en log
    return new Response(JSON.stringify({ received: true, warning: 'DB not configured' }), { status: 200 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const meta = session.metadata || {};
        const partId = meta.partId;
        const kind = meta.kind;

        const invoiceId = typeof session.invoice === 'string' ? session.invoice : null;

        if (kind === 'messages') {
          // Venta de mensaje en salpicadera
          const msgId = crypto.randomUUID();
          const text = meta.msg || '';
          const name = meta.roofName || null;
          const email = meta.email || session.customer_email || '';

          await env.DB.prepare(
            `INSERT INTO messages (id, part_id, text, name, email, stripe_session_id, stripe_invoice_id, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
          ).bind(msgId, partId, text, name, email, session.id, invoiceId, Date.now()).run();
        } else if (partId) {
          // Venta de pieza publicitaria a marca
          const brand = meta.brand || 'Marca patrocinadora';
          const color = meta.color || '#2f6fe0';
          const logoUrl = meta.logoUrl || null;
          const email = meta.email || session.customer_email || '';
          const link = meta.link || null;

          await env.DB.prepare(
            `INSERT INTO sales (part_id, brand, color, logo_url, email, link, status, reserved_until, stripe_session_id, stripe_invoice_id, created_at)
             VALUES (?, ?, ?, ?, ?, ?, 'sold', NULL, ?, ?, ?)
             ON CONFLICT(part_id) DO UPDATE SET
               brand = excluded.brand,
               color = excluded.color,
               logo_url = COALESCE(excluded.logo_url, sales.logo_url),
               email = excluded.email,
               link = excluded.link,
               status = 'sold',
               reserved_until = NULL,
               stripe_session_id = excluded.stripe_session_id,
               stripe_invoice_id = excluded.stripe_invoice_id`
          ).bind(partId, brand, color, logoUrl, email, link, session.id, invoiceId, Date.now()).run();
        }
        break;
      }

      case 'checkout.session.expired': {
        // Si la sesión de checkout expiró sin pagarse, liberar la pieza en D1 si estaba en 'reserved'
        const session = event.data.object;
        const meta = session.metadata || {};
        const partId = meta.partId;
        const kind = meta.kind;

        if (kind !== 'messages' && partId) {
          await env.DB.prepare(
            `UPDATE sales SET status = 'available', reserved_until = NULL
             WHERE part_id = ? AND status = 'reserved' AND stripe_session_id = ?`
          ).bind(partId, session.id).run();
        }
        break;
      }

      default:
        // Otros eventos de Stripe se ignoran con 200
        break;
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: 'Error procesando webhook', details: err?.message || String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
