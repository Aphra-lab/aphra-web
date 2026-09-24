export interface Env {
  ENVIRONMENT: string;
  COMMIT_SHA: string;
}

const json = (
  body: unknown,
  status = 200,
  headers: Record<string, string> = {},
) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...headers },
  });

export default {
  fetch(request: Request, env: Env): Response {
    const { pathname } = new URL(request.url);

    if (pathname === '/api/health') {
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        return json({ error: 'method_not_allowed' }, 405, {
          allow: 'GET, HEAD',
        });
      }
      return json({
        status: 'ok',
        environment: env.ENVIRONMENT,
        commit: env.COMMIT_SHA,
      });
    }

    return json({ error: 'not_found' }, 404);
  },
};
