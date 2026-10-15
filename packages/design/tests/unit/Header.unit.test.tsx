import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Header } from '@aphralab/design';

describe('Header', () => {
  it('shows the menu button, the logo, the tagline and the counter', () => {
    render(
      <Header menuOpen={false} onMenuToggle={vi.fn()} bottlesSold={450} />,
    );

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'MENU' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(screen.getByRole('img', { name: 'Aphra' })).toBeInTheDocument();
    expect(screen.getByText(/BOISSON DU XVIIe/)).toHaveTextContent(
      'BOISSON DU XVIIeREPENSÉE POUR LE XXIe',
    );
    expect(screen.getByText('000450')).toBeInTheDocument();
  });

  it('reports the menu state and toggles it', async () => {
    const onMenuToggle = vi.fn();
    render(<Header menuOpen onMenuToggle={onMenuToggle} />);

    const menu = screen.getByRole('button', { name: 'MENU' });
    expect(menu).toHaveAttribute('aria-expanded', 'true');

    await userEvent.click(menu);

    expect(onMenuToggle).toHaveBeenCalledOnce();
  });

  it('shows the counter placeholder until the number arrives', () => {
    render(<Header menuOpen={false} onMenuToggle={vi.fn()} />);

    expect(screen.getByText('——————')).toBeInTheDocument();
  });
});
