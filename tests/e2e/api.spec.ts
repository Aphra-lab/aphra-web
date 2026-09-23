import { expect, test } from '@playwright/test';

test.describe('API', () => {
  test('answers the health check from the Worker', async ({ request }) => {
    const response = await request.get('/api/health');

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toBe(
      'application/json; charset=utf-8',
    );
    expect(await response.json()).toEqual({
      status: 'ok',
      environment: 'production',
      commit: 'local',
    });
  });

  test('answers unknown API paths with JSON, not the page', async ({
    request,
  }) => {
    for (const path of ['/api', '/api/nope']) {
      const response = await request.get(path);

      expect(response.status()).toBe(404);
      expect(response.headers()['content-type']).toBe(
        'application/json; charset=utf-8',
      );
    }
  });
});
