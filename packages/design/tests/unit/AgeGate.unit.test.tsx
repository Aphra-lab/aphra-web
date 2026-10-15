import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  AGE_CONSENT_KEY,
  AGE_DECLARATION,
  AgeGate,
  HEALTH_WARNING,
} from '@aphralab/design';

import { leaveSite } from '../../src/consent/leaveSite';

vi.mock('../../src/consent/leaveSite', () => ({ leaveSite: vi.fn() }));

afterEach(() => {
  vi.restoreAllMocks();
  vi.mocked(leaveSite).mockClear();
  window.localStorage.clear();
});

function renderGate(exitUrl?: string) {
  return render(
    <AgeGate exitUrl={exitUrl}>
      <p>Le site</p>
    </AgeGate>,
  );
}

describe('AgeGate', () => {
  it('asks for the legal age and renders no site content before consent', () => {
    renderGate();

    expect(
      screen.getByRole('dialog', { name: AGE_DECLARATION }),
    ).toBeInTheDocument();
    expect(screen.queryByText('Le site')).toBeNull();
    expect(screen.getByRole('button', { name: 'OUI' })).toHaveFocus();
    expect(screen.getByText(HEALTH_WARNING)).toHaveClass('text-paper');
  });

  it('keeps the health warning inside the age dialog', () => {
    renderGate();

    expect(
      within(screen.getByRole('dialog', { name: AGE_DECLARATION })).getByText(
        HEALTH_WARNING,
      ),
    ).toBeInTheDocument();
  });

  it('plays the envelope reveal after OUI, then shows the site', async () => {
    const { container } = renderGate();

    await userEvent.click(screen.getByRole('button', { name: 'OUI' }));

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByRole('status')).toHaveTextContent(
      "Ouverture de l'enveloppe",
    );
    expect(screen.queryByText('Le site')).toBeNull();
    expect(screen.getByText(HEALTH_WARNING)).toBeInTheDocument();
    expect(window.localStorage.getItem(AGE_CONSENT_KEY)).not.toBeNull();

    const card = container.querySelector('[data-part="card"]');
    if (!card) throw new Error('card not found');
    fireEvent.animationEnd(card);

    expect(screen.getByText('Le site')).toBeInTheDocument();
  });

  it('shows the site at once when consent is stored', () => {
    window.localStorage.setItem(AGE_CONSENT_KEY, '2026-09-30T10:00:00.000Z');
    renderGate();

    expect(screen.getByText('Le site')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('leaves the site on NON', async () => {
    renderGate('https://example.org/');

    await userEvent.click(screen.getByRole('button', { name: 'NON' }));

    expect(leaveSite).toHaveBeenCalledWith('https://example.org/');
    expect(screen.queryByText('Le site')).toBeNull();
  });

  it('still works when storage is blocked', async () => {
    vi.spyOn(window.localStorage, 'getItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError');
    });
    vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError');
    });
    renderGate();

    await userEvent.click(screen.getByRole('button', { name: 'OUI' }));
    await userEvent.keyboard('{Enter}');

    expect(screen.getByText('Le site')).toBeInTheDocument();
  });
});
