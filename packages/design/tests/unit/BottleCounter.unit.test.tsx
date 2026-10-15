import { render, screen } from '@testing-library/react';

import { BottleCounter } from '@aphralab/design';

const LOADING = 'Nombre de bouteilles vendues en cours de chargement';

describe('BottleCounter', () => {
  it('pads the count to six digits and names it for screen readers', () => {
    render(<BottleCounter value={450} />);

    expect(screen.getByText('000450')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('450 bouteilles vendues')).toHaveClass('sr-only');
  });

  it.each([
    [0, '0 bouteille vendue'],
    [1, '1 bouteille vendue'],
    [2, '2 bouteilles vendues'],
  ])('uses the right French form for %i', (value, label) => {
    render(<BottleCounter value={value} />);

    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('formats large counts the French way and never cuts digits', () => {
    render(<BottleCounter value={1234567} />);

    expect(screen.getByText('1234567')).toBeInTheDocument();
    expect(
      screen.getByText('1 234 567 bouteilles vendues'),
    ).toBeInTheDocument();
  });

  it('drops decimals', () => {
    render(<BottleCounter value={450.9} />);

    expect(screen.getByText('000450')).toBeInTheDocument();
  });

  it.each([undefined, -3, Number.NaN, Number.POSITIVE_INFINITY])(
    'shows a placeholder for %s',
    (value) => {
      const { container } = render(<BottleCounter value={value} />);

      expect(screen.getByText('——————')).toHaveAttribute('aria-hidden', 'true');
      expect(screen.getByText(LOADING)).toBeInTheDocument();
      expect(container.firstChild).toHaveAttribute('aria-busy', 'true');
    },
  );
});
