import { expect, test } from '@playwright/test';

import { cname, mx, ns, txt } from './support/dns';
import { MAIL, mailProvider } from './support/mail';

const DOMAINS = ['aphralab.com', 'aphralab.fr', 'aphralab.online'];

test.describe('registrar', { tag: '@services' }, () => {
  for (const domain of DOMAINS) {
    test(`${domain} delegates to Cloudflare`, async () => {
      const servers = await ns(domain);

      expect(servers.length).toBeGreaterThanOrEqual(2);
      for (const server of servers)
        expect(server).toMatch(/\.ns\.cloudflare\.com$/);
    });

    test(`${domain} stays registered for more than 30 days`, async ({
      request,
    }) => {
      const response = await request.get(`https://rdap.org/domain/${domain}`);
      expect(response.status()).toBe(200);

      const data = (await response.json()) as {
        events?: { eventAction: string; eventDate: string }[];
      };
      const expiry = data.events?.find(
        (event) => event.eventAction === 'expiration',
      )?.eventDate;
      expect(expiry, `no expiration event for ${domain}`).toBeTruthy();
      expect(
        (Date.parse(expiry ?? '') - Date.now()) / 86_400_000,
      ).toBeGreaterThan(30);
    });
  }
});

test.describe(
  `mail for aphralab.com (${mailProvider})`,
  { tag: '@services' },
  () => {
    const expected = MAIL[mailProvider];

    test('MX records point to the provider', async () => {
      const hosts = (await mx('aphralab.com'))
        .map((record) => record.exchange)
        .sort();

      expect(hosts).toEqual([...expected.mx].sort());
    });

    test('SPF includes the provider', async () => {
      const spf = (await txt('aphralab.com')).filter((record) =>
        record.startsWith('v=spf1'),
      );

      expect(spf).toHaveLength(1);
      expect(spf[0]).toContain(expected.spfInclude);
    });

    test('DKIM key is published', async () => {
      const { dkim } = expected;
      if (dkim.kind === 'cname') {
        expect(await cname(dkim.name)).toEqual([dkim.target]);
      } else {
        expect(
          (await txt(dkim.name)).some((record) =>
            record.startsWith(dkim.prefix),
          ),
        ).toBe(true);
      }
    });

    test('DMARC policy exists', async () => {
      expect(
        (await txt('_dmarc.aphralab.com')).some((record) =>
          record.startsWith('v=DMARC1'),
        ),
      ).toBe(true);
    });
  },
);

test.describe('domains without mail', { tag: '@services' }, () => {
  for (const domain of ['aphralab.fr', 'aphralab.online']) {
    test(`${domain} refuses mail`, async () => {
      const records = await mx(domain);
      expect(records).toHaveLength(1);
      expect(records[0]?.priority).toBe(0);
      expect(['', '.']).toContain(records[0]?.exchange);

      expect(await txt(domain)).toContain('v=spf1 -all');
      expect(await txt(`_dmarc.${domain}`)).toContain('v=DMARC1; p=reject');
    });
  }
});
