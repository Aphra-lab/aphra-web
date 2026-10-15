interface FontBucket {
  get(key: string): Promise<{ body: ReadableStream; httpEtag: string } | null>;
}

export interface Env {
  ENVIRONMENT: string;
  COMMIT_SHA: string;
  FONTS?: FontBucket;
}

// The Magnolia web licence covers one domain name.
const FONT_HOST = 'aphralab.com';
const FONT_PATH = /^\/fonts\/([a-z0-9-]+\.(woff2?))$/;
const FONT_TYPES: Record<string, string> = {
  woff: 'font/woff',
  woff2: 'font/woff2',
};

const json = (
  body: unknown,
  status = 200,
  headers: Record<string, string> = {},
) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...headers },
  });

const notFound = () => json({ error: 'not_found' }, 404);
const methodNotAllowed = () =>
  json({ error: 'method_not_allowed' }, 405, { allow: 'GET, HEAD' });
const isRead = (request: Request) =>
  request.method === 'GET' || request.method === 'HEAD';

async function serveFont(request: Request, url: URL, env: Env) {
  const match = FONT_PATH.exec(url.pathname);
  if (url.hostname !== FONT_HOST || !match || !env.FONTS) return notFound();
  if (!isRead(request)) return methodNotAllowed();

  const [, key, extension] = match;
  const file = await env.FONTS.get(key);
  if (!file) return notFound();

  return new Response(request.method === 'HEAD' ? null : file.body, {
    headers: {
      'content-type': FONT_TYPES[extension],
      'cache-control': 'public, max-age=604800',
      etag: file.httpEtag,
    },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/fonts' || url.pathname.startsWith('/fonts/')) {
      return serveFont(request, url, env);
    }

    if (url.pathname === '/api/health') {
      if (!isRead(request)) return methodNotAllowed();
      return json({
        status: 'ok',
        environment: env.ENVIRONMENT,
        commit: env.COMMIT_SHA,
      });
    }

    return notFound();
  },
};
