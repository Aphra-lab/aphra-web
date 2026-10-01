import { readFileSync } from 'node:fs';

import { render, screen } from '@testing-library/react';

import { Logo, Logomark, Signature } from '@aphralab/design';

import { LOGO_FILES } from '../../src/components/Logo/Logo';
import { LOGOMARK_FILES } from '../../src/components/Logomark/Logomark';
import { SIGNATURE_RATIO } from '../../src/components/Signature/Signature';

function viewBoxRatio(file: string) {
  const match = /viewBox="([\d.]+) ([\d.]+) ([\d.]+) ([\d.]+)"/.exec(
    readFileSync(`packages/design/assets/${file}`, 'utf8'),
  );
  if (!match) throw new Error(`${file} has no viewBox`);
  return Number(match[3]) / Number(match[4]);
}

describe('Logo', () => {
  it('draws the wordmark in the current colour, named Aphra', () => {
    render(<Logo />);

    const logo = screen.getByRole('img', { name: 'Aphra' });
    expect(logo.style.getPropertyValue('--mask-src')).toContain(
      'logo-wordmark.svg',
    );
    expect(logo).toHaveClass('bg-current', 'h-16');
  });

  it('draws the wordmark with the moon', () => {
    render(<Logo variant="wordmark-moon" className="h-10" />);

    const logo = screen.getByRole('img', { name: 'Aphra' });
    expect(logo.style.getPropertyValue('--mask-src')).toContain(
      'logo-wordmark-moon.svg',
    );
    expect(logo).toHaveClass('h-10');
    expect(logo).not.toHaveClass('h-16');
  });

  it.each([
    ['wordmark', 'logo-wordmark.svg'],
    ['wordmark-moon', 'logo-wordmark-moon.svg'],
  ] as const)('keeps the %s aspect ratio of its SVG', (variant, file) => {
    expect(LOGO_FILES[variant].ratio).toBeCloseTo(viewBoxRatio(file), 3);
  });
});

describe('Logomark', () => {
  it.each([1, 2, 3, 4, 5, 6] as const)('draws moon face %i', (face) => {
    render(<Logomark face={face} />);

    expect(
      screen
        .getByRole('img', { name: 'Aphra' })
        .style.getPropertyValue('--mask-src'),
    ).toContain(`logomark-${face}.svg`);
    expect(LOGOMARK_FILES[face].ratio).toBeCloseTo(
      viewBoxRatio(`logomark-${face}.svg`),
      3,
    );
  });

  it('draws the stamp texture', () => {
    render(<Logomark face="stamp" />);

    expect(
      screen
        .getByRole('img', { name: 'Aphra' })
        .style.getPropertyValue('--mask-src'),
    ).toContain('logomark-stamp.webp');
  });

  it('hides a decorative logomark from assistive technology', () => {
    const { container } = render(<Logomark decorative />);

    expect(screen.queryByRole('img')).toBeNull();
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('Signature', () => {
  it('draws the signature and the team line', () => {
    render(<Signature team />);

    expect(screen.getByRole('img', { name: 'Aphra' })).toBeInTheDocument();
    expect(screen.getByText('Aphra team.')).toBeInTheDocument();
  });

  it('keeps the aspect ratio of signature.svg', () => {
    expect(SIGNATURE_RATIO).toBeCloseTo(viewBoxRatio('signature.svg'), 3);
  });
});
