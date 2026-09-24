import { render, screen } from '@testing-library/react';

import App from '../../src/App';

describe('App routes', () => {
  afterEach(() => {
    window.history.pushState({}, '', '/');
  });

  it('renders the home page on /', () => {
    render(<App />);

    expect(screen.getByRole('img')).toHaveAttribute('src', '/aphra-hello.jpg');
  });

  it('sends unknown paths to /', () => {
    window.history.pushState({}, '', '/contact');
    render(<App />);

    expect(window.location.pathname).toBe('/');
    expect(screen.getByRole('img')).toHaveAttribute('src', '/aphra-hello.jpg');
  });
});
