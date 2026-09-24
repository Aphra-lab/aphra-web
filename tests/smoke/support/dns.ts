import { Resolver } from 'node:dns/promises';

const resolver = new Resolver();
resolver.setServers(['1.1.1.1', '8.8.8.8']);

export const txt = async (name: string) =>
  (await resolver.resolveTxt(name)).map((chunks) => chunks.join(''));
export const mx = (name: string) => resolver.resolveMx(name);
export const ns = (name: string) => resolver.resolveNs(name);
export const cname = (name: string) => resolver.resolveCname(name);
