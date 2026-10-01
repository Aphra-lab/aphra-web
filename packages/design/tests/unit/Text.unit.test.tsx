import { render, screen } from '@testing-library/react';

import { Text } from '@aphralab/design';

describe('Text', () => {
  it('renders a paragraph in the body style by default', () => {
    render(<Text>Bienvenue,</Text>);

    const text = screen.getByText('Bienvenue,');
    expect(text.tagName).toBe('P');
    expect(text).toHaveClass('font-mono', 'text-body');
  });

  it('renders the caption style on the element given by as, keeping the case', () => {
    render(
      <Text as="span" variant="caption">
        BOISSON DU XVIIe
      </Text>,
    );

    const text = screen.getByText('BOISSON DU XVIIe');
    expect(text.tagName).toBe('SPAN');
    expect(text).toHaveClass('text-caption');
    expect(text).not.toHaveClass('uppercase');
  });

  it('keeps extra classes and attributes', () => {
    render(
      <Text variant="nav" id="menu" className="text-center">
        MENU
      </Text>,
    );

    const text = screen.getByText('MENU');
    expect(text).toHaveAttribute('id', 'menu');
    expect(text).toHaveClass('text-nav', 'text-center');
  });
});
