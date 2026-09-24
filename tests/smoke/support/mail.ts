export type MailProvider = 'hostinger' | 'google';

interface MailExpectation {
  mx: string[];
  spfInclude: string;
  dkim:
    | { name: string; kind: 'cname'; target: string }
    | { name: string; kind: 'txt'; prefix: string };
}

export const MAIL: Record<MailProvider, MailExpectation> = {
  hostinger: {
    mx: ['mx1.hostinger.com', 'mx2.hostinger.com'],
    spfInclude: 'include:_spf.mail.hostinger.com',
    dkim: {
      name: 'hostingermail-a._domainkey.aphralab.com',
      kind: 'cname',
      target: 'hostingermail-a.dkim.mail.hostinger.com',
    },
  },
  google: {
    mx: ['smtp.google.com'],
    spfInclude: 'include:_spf.google.com',
    dkim: {
      name: 'google._domainkey.aphralab.com',
      kind: 'txt',
      prefix: 'v=DKIM1;',
    },
  },
};

export const mailProvider = (process.env.MAIL_PROVIDER ??
  'google') as MailProvider;
