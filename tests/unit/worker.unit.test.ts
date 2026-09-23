// @vitest-environment node
import worker from '../../worker/index';

const env = { ENVIRONMENT: 'test', COMMIT_SHA: 'abc123' };
const call = (path: string, init?: RequestInit) =>
  worker.fetch(new Request(`https://aphralab.com${path}`, init), env);

describe('worker', () => {
  it('reports health with the environment and the commit', async () => {
    const response = call('/api/health');

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

  it('accepts HEAD on the health check', () => {
    expect(call('/api/health', { method: 'HEAD' }).status).toBe(200);
  });

  it('rejects other methods on the health check', async () => {
    const response = call('/api/health', { method: 'POST' });

    expect(response.status).toBe(405);
    expect(response.headers.get('allow')).toBe('GET, HEAD');
    expect(await response.json()).toEqual({ error: 'method_not_allowed' });
  });

  it.each(['/api', '/api/', '/api/nope'])(
    'answers %s with a JSON 404',
    async (path) => {
      const response = call(path);

      expect(response.status).toBe(404);
      expect(response.headers.get('content-type')).toBe(
        'application/json; charset=utf-8',
      );
      expect(await response.json()).toEqual({ error: 'not_found' });
    },
  );
});
