import { render, screen } from '@testing-library/react';

import App from '../../src/App';

describe('App integration', () => {
  it('renders the full hello page through the router', () => {
    render(<App />);

    expect(
      screen.getByRole('img', { name: /contact@aphralab\.com/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/abus d'alcool est dangereux pour la santé/),
    ).toBeInTheDocument();
    expect(window.location.pathname).toBe('/');
  });
});
