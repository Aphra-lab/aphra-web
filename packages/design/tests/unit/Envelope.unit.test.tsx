import { render, screen } from '@testing-library/react';

import { Envelope } from '../../src/components/Envelope/Envelope';

function part(container: HTMLElement, name: string) {
  const element = container.querySelector(`[data-part="${name}"]`);
  if (!(element instanceof HTMLElement)) throw new Error(`${name} not found`);
  return element;
}

describe('Envelope', () => {
  it('is decorative and keeps its content accessible', () => {
    const { container } = render(
      <Envelope state="closed">
        <button type="button">OUI</button>
      </Envelope>,
    );

    expect(screen.getByRole('button', { name: 'OUI' })).toBeInTheDocument();
    expect(screen.queryByRole('img')).toBeNull();
    expect(part(container, 'card')).toHaveAttribute('aria-hidden', 'true');
    expect(part(container, 'flap')).toHaveAttribute('aria-hidden', 'true');
  });

  it('animates only when opening', () => {
    const { container, rerender } = render(<Envelope state="closed" />);
    expect(part(container, 'flap').className).not.toContain('animate-');

    rerender(<Envelope state="opening" />);
    expect(part(container, 'flap')).toHaveClass(
      'motion-safe:animate-flap-open',
    );
    expect(part(container, 'card')).toHaveClass(
      'motion-safe:animate-card-rise',
    );
  });

  it('gives each envelope its own grain filter id', () => {
    const { container } = render(
      <>
        <Envelope state="closed" />
        <Envelope state="closed" />
      </>,
    );

    const ids = [...container.querySelectorAll('filter')].map(
      (filter) => filter.id,
    );
    expect(ids.length).toBeGreaterThan(1);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
