// @vitest-environment node
import worker, { type Env } from '../../worker/index';

const FILES: Record<string, string> = {
  'magnolia-cora-script.woff2': 'woff2-bytes',
  'magnolia-cora-smooth-script.woff': 'woff-bytes',
};

const readFont = () =>
  vi.fn((key: string) =>
    Promise.resolve(
      key in FILES
        ? { body: new Response(FILES[key]).body!, httpEtag: '"etag-1"' }
        : null,
    ),
  );

const makeEnv = (overrides: Partial<Env> = {}): Env => ({
  ENVIRONMENT: 'test',
  COMMIT_SHA: 'abc123',
  FONTS: { get: readFont() },
  ...overrides,
});

const withSpy = () => {
  const get = readFont();
  return { env: makeEnv({ FONTS: { get } }), get };
};

const call = (
  path: string,
  init?: RequestInit,
  env = makeEnv(),
  origin = 'https://aphralab.com',
) => worker.fetch(new Request(`${origin}${path}`, init), env);

describe('worker', () => {
  it('reports health with the environment and the commit', async () => {
    const response = await call('/api/health');

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe(
      'application/json; charset=utf-8',
    );
    expect(await response.json()).toEqual({
      status: 'ok',
      environment: 'test',
      commit: 'abc123',
    });
  });

  it('accepts HEAD on the health check', async () => {
    expect((await call('/api/health', { method: 'HEAD' })).status).toBe(200);
  });

  it('rejects other methods on the health check', async () => {
    const response = await call('/api/health', { method: 'POST' });

    expect(response.status).toBe(405);
    expect(response.headers.get('allow')).toBe('GET, HEAD');
    expect(await response.json()).toEqual({ error: 'method_not_allowed' });
  });

  it.each(['/api', '/api/', '/api/nope'])(
    'answers %s with a JSON 404',
    async (path) => {
      const response = await call(path);

      expect(response.status).toBe(404);
      expect(response.headers.get('content-type')).toBe(
        'application/json; charset=utf-8',
      );
      expect(await response.json()).toEqual({ error: 'not_found' });
    },
  );
});

describe('worker fonts', () => {
  it('serves a Magnolia woff2 file from the bucket on aphralab.com', async () => {
    const { env, get } = withSpy();
    const response = await call(
      '/fonts/magnolia-cora-script.woff2',
      undefined,
      env,
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('font/woff2');
    expect(response.headers.get('cache-control')).toBe(
      'public, max-age=604800',
    );
    expect(response.headers.get('etag')).toBe('"etag-1"');
    expect(await response.text()).toBe('woff2-bytes');
    expect(get).toHaveBeenCalledWith('magnolia-cora-script.woff2');
  });

  it('serves woff files with the woff type', async () => {
    const response = await call('/fonts/magnolia-cora-smooth-script.woff');

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('font/woff');
  });

  it('sends no CORS header, so other sites cannot load the font', async () => {
    const response = await call('/fonts/magnolia-cora-script.woff2');

    expect(response.headers.get('access-control-allow-origin')).toBeNull();
  });

  it('answers HEAD with the headers and no body', async () => {
    const response = await call('/fonts/magnolia-cora-script.woff2', {
      method: 'HEAD',
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('font/woff2');
    expect(response.body).toBeNull();
  });

  it('rejects other methods', async () => {
    const response = await call('/fonts/magnolia-cora-script.woff2', {
      method: 'POST',
    });

    expect(response.status).toBe(405);
    expect(response.headers.get('allow')).toBe('GET, HEAD');
  });

  it.each([
    'https://www.aphralab.com',
    'https://design.aphralab.com',
    'https://aphra-web-staging.aphralab.workers.dev',
    'http://localhost:5173',
  ])('never serves the font on %s (one-domain web licence)', async (origin) => {
    const { env, get } = withSpy();
    const response = await call(
      '/fonts/magnolia-cora-script.woff2',
      undefined,
      env,
      origin,
    );

    expect(response.status).toBe(404);
    expect(get).not.toHaveBeenCalled();
  });

  it.each([
    '/fonts',
    '/fonts/',
    '/fonts/MagnoliaCoraScript-Regular.otf',
    '/fonts/sub/magnolia-cora-script.woff2',
    '/fonts/..%2Fsecret.woff2',
  ])('refuses the path %s without reading the bucket', async (path) => {
    const { env, get } = withSpy();
    const response = await call(path, undefined, env);

    expect(response.status).toBe(404);
    expect(get).not.toHaveBeenCalled();
  });

  it('answers 404 when the file is not in the bucket', async () => {
    const response = await call('/fonts/missing.woff2');

    expect(response.status).toBe(404);
  });

  it('answers 404 when no bucket is bound', async () => {
    const response = await call(
      '/fonts/magnolia-cora-script.woff2',
      undefined,
      makeEnv({ FONTS: undefined }),
    );

    expect(response.status).toBe(404);
  });
});
