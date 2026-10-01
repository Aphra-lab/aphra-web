// @vitest-environment node
import { existsSync, readFileSync } from 'node:fs';

import { RECIPES } from '@aphralab/design';

import {
  ILLUSTRATION_SIZES,
  STAMP_SIZE,
} from '../../src/generated/asset-sizes';

const ASSETS = 'packages/design/assets';
const LOGOS = [
  'logo-wordmark',
  'logo-wordmark-moon',
  'logomark-1',
  'logomark-2',
  'logomark-3',
  'logomark-4',
  'logomark-5',
  'logomark-6',
];
const ILLUSTRATIONS = ['concombre', 'mangue', 'pomme', 'poivron', 'tomate'];

describe('logo assets', () => {
  it.each(LOGOS)('%s.svg draws with currentColor only', (name) => {
    const svg = readFileSync(`${ASSETS}/${name}.svg`, 'utf8');

    expect(svg).toContain('currentColor');
    expect(svg).not.toMatch(/#[0-9a-f]{3}(?:[0-9a-f]{3})?\b/i);
    expect(svg).toMatch(/viewBox="[\d. ]+"/);
  });

  it('has the stamp texture as WebP with its size', () => {
    expect(existsSync(`${ASSETS}/logomark-stamp.webp`)).toBe(true);
    expect(STAMP_SIZE.width).toBeGreaterThan(0);
    expect(STAMP_SIZE.height).toBeGreaterThan(0);
  });

  it('has a signature drawing', () => {
    expect(readFileSync(`${ASSETS}/signature.svg`, 'utf8')).toMatch(
      /viewBox="[\d. ]+"/,
    );
  });
});

describe('illustration assets', () => {
  it.each(ILLUSTRATIONS)('%s has three trimmed WebP files', (name) => {
    for (const variant of ['480', '960', 'full']) {
      expect(existsSync(`${ASSETS}/illustration-${name}-${variant}.webp`)).toBe(
        true,
      );
    }
    const size = ILLUSTRATION_SIZES[name as keyof typeof ILLUSTRATION_SIZES];
    expect(size.width).toBeGreaterThan(960);
    expect(size.width).toBeLessThanOrEqual(1920);
  });

  it('covers every recipe', () => {
    for (const recipe of RECIPES) {
      expect(Object.keys(ILLUSTRATION_SIZES)).toContain(recipe.illustration);
    }
  });
});
