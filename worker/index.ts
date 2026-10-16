// ==============================================================================
// Cloudflare Worker Entrypoint para Cloudflare Workers con Static Assets
// Proyecto: Proyect Car
//
// Une el frontend estático compilado en /dist (ASSETS) con los endpoints
// serverless existentes en /functions/api/* conectando D1 (DB) y R2 (BUCKET).
// ==============================================================================

import { onRequestGet as getSales } from '../functions/api/sales';
import { onRequestPost as createPaypalOrder } from '../functions/api/create-paypal-order';
import { onRequestGet as getAdminOrders, onRequestPost as postAdminOrders } from '../functions/api/admin/orders';
import { onRequestPost as uploadLogo } from '../functions/api/upload-logo';
import { onRequestGet as getLogo } from '../functions/api/logo/[...key]';
import { onRequestPost as createCheckoutSession } from '../functions/api/create-checkout-session';
import { onRequestPost as webhookStripe } from '../functions/api/webhook';

export interface Env {
  ASSETS: {
    fetch: (request: Request | string) => Promise<Response>;
  };
  DB?: D1Database;
  BUCKET?: any;
  PAYPAL_ME_USER?: string;
  VITE_PAYPAL_ME_USER?: string;
  ADMIN_SECRET_KEY?: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  SITE_URL?: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // Manejo de preflight CORS si es necesario
    if (method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // Rutas de API (/api/...)
    if (path.startsWith('/api/')) {
      const context: any = {
        request,
        env,
        params: {},
        waitUntil: (promise: Promise<any>) => ctx.waitUntil(promise),
        next: () => Promise.resolve(new Response('Not found', { status: 404 })),
        data: {},
      };

      try {
        if (path === '/api/sales' && method === 'GET') {
          return await getSales(context);
        }

        if (path === '/api/create-paypal-order' && method === 'POST') {
          return await createPaypalOrder(context);
        }

        if (path === '/api/admin/orders') {
          if (method === 'GET') return await getAdminOrders(context);
          if (method === 'POST') return await postAdminOrders(context);
        }

        if (path === '/api/upload-logo' && method === 'POST') {
          return await uploadLogo(context);
        }

        if (path.startsWith('/api/logo/')) {
          const key = path.replace(/^\/api\/logo\//, '');
          context.params = { key };
          if (method === 'GET') return await getLogo(context);
        }

        if (path === '/api/create-checkout-session' && method === 'POST') {
          return await createCheckoutSession(context);
        }

        if (path === '/api/webhook' && method === 'POST') {
          return await webhookStripe(context);
        }

        return new Response(JSON.stringify({ error: `Ruta API no encontrada: ${path}` }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (err: any) {
        return new Response(
          JSON.stringify({ error: 'Error interno en el servidor', details: err?.message || String(err) }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Para cualquier otra ruta: Servir activos estáticos de Vite (/dist)
    const assetResponse = await env.ASSETS.fetch(request);

    // Fallback SPA: Si la ruta no es un archivo físico y dio 404, servir index.html
    if (assetResponse.status === 404 && request.headers.get('accept')?.includes('text/html')) {
      const indexReq = new Request(new URL('/index.html', request.url), request);
      return env.ASSETS.fetch(indexReq);
    }

    return assetResponse;
  },
};
