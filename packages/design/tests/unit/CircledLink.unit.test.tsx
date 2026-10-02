import type { ComponentProps } from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CircledLink } from '@aphralab/design';

function RouterLink(props: ComponentProps<'a'>) {
  return <a data-router="true" {...props} />;
}

describe('CircledLink', () => {
  it('renders a link circled by a decorative ellipse', () => {
    render(<CircledLink href="/recettes">recettes</CircledLink>);

    const link = screen.getByRole('link', { name: 'recettes' });
    expect(link).toHaveAttribute('href', '/recettes');
    expect(link.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('merges into the child element with asChild', () => {
    render(
      <CircledLink asChild>
        <RouterLink href="/partenaires">partenaires</RouterLink>
      </CircledLink>,
    );

    const link = screen.getByRole('link', { name: 'partenaires' });
    expect(link).toHaveAttribute('data-router', 'true');
    expect(link).toHaveClass('relative');
    expect(link.querySelector('svg')).not.toBeNull();
  });

  it('draws a different ellipse for each shape', () => {
    const { container } = render(
      <>
        <CircledLink href="#a" shape={1}>
          a
        </CircledLink>
        <CircledLink href="#b" shape={2}>
          b
        </CircledLink>
        <CircledLink href="#c" shape={3}>
          c
        </CircledLink>
      </>,
    );

    const paths = [...container.querySelectorAll('path')].map((path) =>
      path.getAttribute('d'),
    );
    expect(new Set(paths).size).toBe(3);
  });

  it('is reachable with the keyboard', async () => {
    render(<CircledLink href="/contact">contacter</CircledLink>);

    await userEvent.tab();

    expect(screen.getByRole('link', { name: 'contacter' })).toHaveFocus();
  });
});
