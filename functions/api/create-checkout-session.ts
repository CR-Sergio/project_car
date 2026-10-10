// Cloudflare Pages Function: POST /api/create-checkout-session
// Valida disponibilidad, reserva la pieza por 15 minutos en D1 y genera la sesión de Stripe Checkout

interface Env {
  DB?: D1Database;
  STRIPE_SECRET_KEY?: string;
  SITE_URL?: string;
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
      news?: boolean;
      cur?: 'MXN' | 'USD';
    };

    const { partId, brand = '', color = '#2f6fe0', email = '', link = '', logoUrl = '', msg = '', roofName = '', news = false, cur = 'MXN' } = body;

    if (!partId || !SERVER_PRICES[partId]) {
      return new Response(JSON.stringify({ error: 'Pieza no válida' }), { status: 400 });
    }

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return new Response(JSON.stringify({ error: 'Correo electrónico no válido' }), { status: 400 });
    }

    const item = SERVER_PRICES[partId];
    if (item.kind === 'names') {
      return new Response(JSON.stringify({ error: 'El techo no está a la venta' }), { status: 400 });
    }

    const isMessage = item.kind === 'messages';
    const now = Date.now();
    const reservationMs = 15 * 60 * 1000; // 15 minutos
    const expiresAtMs = now + reservationMs;

    // 1. Verificación de disponibilidad en D1 (si D1 está configurado)
    if (env.DB) {
      if (isMessage) {
        // Validar cupo de mensajes (máximo 120 por salpicadera)
        const countRes = await env.DB.prepare(
          `SELECT COUNT(*) as count FROM messages WHERE part_id = ?`
        ).bind(partId).first<{ count: number }>();

        if (countRes && countRes.count >= 120) {
          return new Response(
            JSON.stringify({ error: 'Esta salpicadera ya alcanzó el límite de 120 mensajes' }),
            { status: 400 }
          );
        }
      } else {
        // Validar si la pieza de marca está vendida o reservada activamente
        const existing = await env.DB.prepare(
          `SELECT status, reserved_until FROM sales WHERE part_id = ?`
        ).bind(partId).first<{ status: string; reserved_until: number | null }>();

        if (existing) {
          if (existing.status === 'sold') {
            return new Response(
              JSON.stringify({ error: 'Esta pieza ya fue vendida y no está disponible' }),
              { status: 409 }
            );
          }
          if (existing.status === 'reserved' && existing.reserved_until && existing.reserved_until > now) {
            const minutesLeft = Math.ceil((existing.reserved_until - now) / 60000);
            return new Response(
              JSON.stringify({
                error: `Esta pieza está temporalmente apartada en proceso de pago por otra persona. Si no completa su compra, quedará libre en ~${minutesLeft} minutos.`,
                reservedUntil: existing.reserved_until,
              }),
              { status: 409 }
            );
          }
        }

        // Crear/actualizar la reserva por 15 minutos
        await env.DB.prepare(
          `INSERT INTO sales (part_id, brand, color, logo_url, email, link, status, reserved_until, created_at)
           VALUES (?, ?, ?, ?, ?, ?, 'reserved', ?, ?)
           ON CONFLICT(part_id) DO UPDATE SET
             brand = excluded.brand,
             color = excluded.color,
             logo_url = excluded.logo_url,
             email = excluded.email,
             link = excluded.link,
             status = 'reserved',
             reserved_until = excluded.reserved_until`
        ).bind(partId, brand.trim(), color, logoUrl.trim() || null, email.trim(), link.trim(), expiresAtMs, now).run();
      }
    }

    // 2. Verificar que exista la clave de Stripe
    if (!env.STRIPE_SECRET_KEY) {
      return new Response(
        JSON.stringify({
          error: 'Falta configurar STRIPE_SECRET_KEY en las variables de entorno de Cloudflare Pages',
        }),
        { status: 500 }
      );
    }

    // 3. Preparar parámetros de la sesión de Stripe
    const origin = env.SITE_URL || new URL(request.url).origin;
    const isUsd = cur === 'USD';
    const currency = isUsd ? 'usd' : 'mxn';
    const amountInCents = isUsd
      ? Math.round((item.price / USD_RATE) * 100)
      : item.price * 100;

    const sessionParams = new URLSearchParams();
    sessionParams.set('mode', 'payment');
    sessionParams.set('customer_email', email.trim());
    sessionParams.set('customer_creation', 'always'); // Asegura la creación del Customer para vincular la Factura e Impuestos
    sessionParams.set('success_url', `${origin}/garage/${partId}?checkout=success&session_id={CHECKOUT_SESSION_ID}`);
    sessionParams.set('cancel_url', `${origin}/garage/${partId}?checkout=cancel`);

    // Métodos de pago: Tarjeta y (si es MXN y monto <= 10,000) OXXO
    sessionParams.append('payment_method_types[]', 'card');
    if (!isUsd && item.price <= 10000) {
      sessionParams.append('payment_method_types[]', 'oxxo');
    }

    // Stripe Tax e Invoicing: Cálculo automático de impuestos y emisión de factura
    sessionParams.set('automatic_tax[enabled]', 'true');
    sessionParams.set('billing_address_collection', 'required'); // Requerido por Stripe Tax para calcular jurisdicción
    sessionParams.set('tax_id_collection[enabled]', 'true');      // Permite capturar RFC en México o Tax ID internacional

    // Facturación automática oficial de Stripe (PDF y folio descargable)
    sessionParams.set('invoice_creation[enabled]', 'true');
    sessionParams.set(
      'invoice_creation[invoice_data][description]',
      isMessage
        ? `Mensaje comunitario rotulado en vinil - Proyect Car`
        : `Espacio de patrocinio publicitario (${item.name}) - Proyect Car Fiat Palio 2013`
    );

    // Concepto del cobro
    sessionParams.set('line_items[0][price_data][currency]', currency);
    sessionParams.set('line_items[0][price_data][unit_amount]', amountInCents.toString());
    sessionParams.set('line_items[0][price_data][tax_behavior]', 'inclusive'); // Precios finales con IVA incluido
    sessionParams.set(
      'line_items[0][price_data][product_data][name]',
      isMessage ? `Mensaje en la raza (${item.name})` : `Espacio publicitario: ${item.name}`
    );
    sessionParams.set(
      'line_items[0][price_data][product_data][description]',
      isMessage
        ? `Mensaje rotulado en vinil de 24 caracteres: "${msg.trim()}". Proyecto Fiat Palio 2013.`
        : `Servicio de publicidad en vinil durante 6 meses para la marca "${brand.trim()}". Proyecto Fiat Palio 2013.`
    );
    sessionParams.set('line_items[0][quantity]', '1');

    // Metadatos para el Webhook de Stripe
    sessionParams.set('metadata[partId]', partId);
    sessionParams.set('metadata[kind]', isMessage ? 'messages' : 'brand');
    sessionParams.set('metadata[email]', email.trim());
    sessionParams.set('metadata[news]', news ? 'true' : 'false');

    if (isMessage) {
      sessionParams.set('metadata[msg]', msg.trim());
      if (roofName.trim()) {
        sessionParams.set('metadata[roofName]', roofName.trim());
      }
    } else {
      sessionParams.set('metadata[brand]', brand.trim());
      sessionParams.set('metadata[color]', color);
      if (link.trim()) {
        sessionParams.set('metadata[link]', link.trim());
      }
      if (logoUrl.trim()) {
        sessionParams.set('metadata[logoUrl]', logoUrl.trim());
      }
    }

    // Llamada a la API REST de Stripe con clave de idempotencia
    const idempotencyKey = `session_${partId}_${email.trim().toLowerCase()}_${Math.floor(now / 60000)}`;
    const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Idempotency-Key': idempotencyKey,
      },
      body: sessionParams.toString(),
    });

    const stripeData = await stripeRes.json() as { id?: string; url?: string; error?: { message: string } };

    if (!stripeRes.ok || !stripeData.url) {
      // Si falló Stripe, liberar la reserva de D1
      if (env.DB && !isMessage) {
        await env.DB.prepare(`UPDATE sales SET status = 'available', reserved_until = NULL WHERE part_id = ?`).bind(partId).run();
      }
      return new Response(
        JSON.stringify({ error: stripeData.error?.message || 'Error al comunicarse con Stripe' }),
        { status: 502 }
      );
    }

    // Guardar stripe_session_id en D1
    if (env.DB && !isMessage && stripeData.id) {
      await env.DB.prepare(
        `UPDATE sales SET stripe_session_id = ? WHERE part_id = ?`
      ).bind(stripeData.id, partId).run();
    }

    return new Response(
      JSON.stringify({ checkoutUrl: stripeData.url, sessionId: stripeData.id }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: 'Error interno en checkout', details: err?.message || String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
