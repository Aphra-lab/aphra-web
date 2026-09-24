import { render, screen } from '@testing-library/react';

import Home from '../../src/pages/Home';

const ALT =
  "Aphra. Bienvenue, voici le site internet d'Aphra. Marque de boisson de dégustation fabriquée à l'aide d'une technique de clarification artisanale. Notre numéro de téléphone : 06 24 51 14 04. Notre mail est : contact@aphralab.com";
const WARNING =
  "L'abus d'alcool est dangereux pour la santé, à consommer avec modération.";

describe('Home', () => {
  it('shows the mock image with its full text as alternative text', () => {
    render(<Home />);

    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', '/aphra-hello.jpg');
    expect(image).toHaveAttribute('alt', ALT);
    expect(image).toHaveAttribute('width', '1004');
    expect(image).toHaveAttribute('height', '650');
  });

  it('shows the health warning', () => {
    render(<Home />);

    expect(screen.getByText(WARNING)).toBeInTheDocument();
  });
});
