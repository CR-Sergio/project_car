// Cloudflare Pages Function: GET /api/logo/[...key]
// Sirve imágenes de logos guardadas en Cloudflare R2 con encabezados de caché inmutable

interface R2Bucket {
  get(key: string): Promise<any>;
}

interface Env {
  BUCKET?: R2Bucket;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { params, env } = context;

  if (!env.BUCKET) {
    return new Response('R2 Bucket not configured', { status: 503 });
  }

  const rawKey = params.key;
  const key = Array.isArray(rawKey) ? rawKey.join('/') : (rawKey as string);

  if (!key) {
    return new Response('Key not provided', { status: 400 });
  }

  try {
    const object = await env.BUCKET.get(key);

    if (!object) {
      return new Response('Imagen no encontrada', { status: 404 });
    }

    const headers = new Headers();
    headers.set('Content-Type', object.httpMetadata?.contentType || 'image/png');
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    headers.set('ETag', object.httpEtag || `"${key}"`);
    headers.set('Access-Control-Allow-Origin', '*');

    return new Response(object.body, { headers });
  } catch (err: any) {
    return new Response(`Error obteniendo imagen: ${err?.message || err}`, { status: 500 });
  }
};
