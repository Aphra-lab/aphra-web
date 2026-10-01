// @vitest-environment node
import sharp from 'sharp';

const ASSETS = 'packages/design/assets';
const ILLUSTRATIONS = ['concombre', 'mangue', 'pomme', 'poivron', 'tomate'];
const EDGE_BAND = 0.02;
const MIN_EDGE_INK = 0.0002;

async function edgeInk(file: string) {
  const { data, info } = await sharp(file)
    .ensureAlpha()
    .extractChannel('alpha')
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const bandX = Math.round(width * EDGE_BAND);
  const bandY = Math.round(height * EDGE_BAND);
  let total = 0;
  let top = 0;
  let bottom = 0;
  let left = 0;
  let right = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const ink = data[y * width + x];
      total += ink;
      if (y < bandY) top += ink;
      if (y >= height - bandY) bottom += ink;
      if (x < bandX) left += ink;
      if (x >= width - bandX) right += ink;
    }
  }
  return {
    top: top / total,
    bottom: bottom / total,
    left: left / total,
    right: right / total,
  };
}

describe('illustration margins', () => {
  it.each(ILLUSTRATIONS)('%s reaches all four edges', async (name) => {
    const share = await edgeInk(`${ASSETS}/illustration-${name}-full.webp`);

    expect(share.top).toBeGreaterThan(MIN_EDGE_INK);
    expect(share.bottom).toBeGreaterThan(MIN_EDGE_INK);
    expect(share.left).toBeGreaterThan(MIN_EDGE_INK);
    expect(share.right).toBeGreaterThan(MIN_EDGE_INK);
  });
});
