// Cloudflare Pages Function: POST /api/upload-logo
// Sube el archivo PNG/JPG/WebP a Cloudflare R2 y retorna la URL pública del logo

interface R2Bucket {
  put(key: string, value: ReadableStream | ArrayBuffer | string, options?: any): Promise<any>;
  get(key: string): Promise<any>;
}

interface Env {
  BUCKET?: R2Bucket;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const partId = (formData.get('partId') as string | null) || 'brand';

    if (!file) {
      return new Response(JSON.stringify({ error: 'No se envió ningún archivo' }), { status: 400 });
    }

    // Validar tipo de archivo
    const validTypes = ['image/png', 'image/jpeg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return new Response(
        JSON.stringify({ error: 'Formato no válido. Solo se aceptan PNG, JPEG o WebP' }),
        { status: 400 }
      );
    }

    // Validar tamaño máximo (10 MB para soportar archivos de alta resolución de imprenta)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return new Response(
        JSON.stringify({ error: 'El archivo supera el límite de 10 MB' }),
        { status: 400 }
      );
    }

    // Extensión del archivo
    const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
    const cleanPart = partId.replace(/[^a-zA-Z0-9_-]/g, '');
    const filename = `${cleanPart}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const key = `logos/${filename}`;

    // Si Cloudflare R2 está vinculado (binding BUCKET)
    if (env.BUCKET) {
      await env.BUCKET.put(key, file.stream(), {
        httpMetadata: {
          contentType: file.type,
          cacheControl: 'public, max-age=31536000, immutable',
        },
      });

      return new Response(
        JSON.stringify({
          logoUrl: `/api/logo/${key}`,
          key,
          filename,
        }),
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Fallback si R2 aún no está configurado en el dashboard:
    // Convertir a Data URL para no bloquear pruebas locales
    const buffer = await file.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
    const dataUrl = `data:${file.type};base64,${base64}`;

    return new Response(
      JSON.stringify({
        logoUrl: dataUrl,
        warning: 'R2 bucket (BUCKET) not bound yet; using fallback Data URL for preview',
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: 'Error al subir el logo', details: err?.message || String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
