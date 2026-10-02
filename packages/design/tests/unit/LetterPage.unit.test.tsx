import { render, screen } from '@testing-library/react';

import { HEALTH_WARNING, LetterPage } from '@aphralab/design';

describe('LetterPage', () => {
  it('lays out the header, the letter, the sign-off and the address', () => {
    render(
      <LetterPage
        header={<p>En-tête</p>}
        signOff={<p>Sobrement,</p>}
        address={<>Aphra SAS</>}
      >
        <p>Bienvenue,</p>
      </LetterPage>,
    );

    expect(screen.getByText('En-tête')).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveTextContent('Bienvenue,');
    expect(screen.getByText('Sobrement,')).toBeInTheDocument();
    expect(screen.getByText('Aphra SAS').closest('address')).not.toBeNull();
  });

  it('always shows the health warning, even with only a letter', () => {
    render(
      <LetterPage>
        <p>Bienvenue,</p>
      </LetterPage>,
    );

    expect(screen.getByRole('contentinfo')).toHaveTextContent(HEALTH_WARNING);
    expect(document.querySelector('address')).toBeNull();
  });

  it('sets the legal text in the measure of the letter', () => {
    render(
      <LetterPage>
        <p>Bienvenue,</p>
      </LetterPage>,
    );

    expect(screen.getByRole('contentinfo')).toHaveClass(
      'max-w-measure',
      'text-body',
    );
  });

  it('draws the ruled column on paper', () => {
    const { container } = render(
      <LetterPage>
        <p>Bienvenue,</p>
      </LetterPage>,
    );

    expect(container.firstChild).toHaveClass('bg-paper', 'text-ink');
    expect(container.firstChild?.firstChild).toHaveClass(
      'border-x',
      'border-ink',
      'md:max-w-letter',
    );
  });
});
