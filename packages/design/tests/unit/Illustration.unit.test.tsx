import { render, screen } from '@testing-library/react';

import { Illustration, RECIPES } from '@aphralab/design';

import { ILLUSTRATION_SIZES } from '../../src/generated/asset-sizes';

describe('Illustration', () => {
  it('serves three WebP widths with the real size of the largest file', () => {
    render(<Illustration name="tomate" alt="Deux tomates sur leur branche" />);

    const image = screen.getByRole('img', {
      name: 'Deux tomates sur leur branche',
    });
    const { width, height } = ILLUSTRATION_SIZES.tomate;
    const sources = (image.getAttribute('srcset') ?? '').split(', ');
    expect(sources).toHaveLength(3);
    expect(sources[0]).toMatch(/illustration-tomate-480\.webp 480w$/);
    expect(sources[1]).toMatch(/illustration-tomate-960\.webp 960w$/);
    expect(sources[2]).toMatch(
      new RegExp(`illustration-tomate-full\\.webp ${width}w$`),
    );
    expect(image).toHaveAttribute('width', String(width));
    expect(image).toHaveAttribute('height', String(height));
    expect(image).toHaveAttribute('loading', 'lazy');
  });

  it('accepts an empty alternative text for a decorative picture', () => {
    const { container } = render(<Illustration name="poivron" alt="" />);

    expect(container.querySelector('img')).toHaveAttribute('alt', '');
  });

  it.each(RECIPES.map((recipe) => recipe.illustration))(
    'renders the %s illustration',
    (name) => {
      render(<Illustration name={name} alt={name} loading="eager" />);

      expect(screen.getByRole('img', { name })).toHaveAttribute(
        'loading',
        'eager',
      );
    },
  );
});
