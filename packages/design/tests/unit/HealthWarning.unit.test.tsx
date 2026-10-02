import { readFileSync } from 'node:fs';

import { render, screen } from '@testing-library/react';

import { HEALTH_WARNING, HealthWarning } from '@aphralab/design';

const WARNING =
  "L'abus d'alcool est dangereux pour la santé, à consommer avec modération.";

describe('HealthWarning', () => {
  it('shows the loi Évin sentence word for word', () => {
    render(<HealthWarning />);

    expect(HEALTH_WARNING).toBe(WARNING);
    expect(screen.getByText(WARNING)).toBeInTheDocument();
  });

  it('uses ink on paper by default and paper on black', () => {
    const { rerender } = render(<HealthWarning />);
    expect(screen.getByText(WARNING)).toHaveClass('text-ink');

    rerender(<HealthWarning tone="black" />);
    expect(screen.getByText(WARNING)).toHaveClass('text-paper');
  });

  it('is at least 12 px and keeps sentence case', () => {
    render(<HealthWarning />);

    expect(screen.getByText(WARNING)).toHaveClass('text-legal');
    expect(screen.getByText(WARNING)).not.toHaveClass('uppercase');
    expect(
      readFileSync('packages/design/src/tokens/tokens.css', 'utf8'),
    ).toMatch(/--text-legal:\s*0\.75rem;/);
  });
});
