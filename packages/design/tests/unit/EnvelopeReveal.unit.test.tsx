import { fireEvent, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { EnvelopeReveal } from '@aphralab/design';

import { REVEAL_FALLBACK_MS } from '../../src/components/EnvelopeReveal/EnvelopeReveal';

function part(container: HTMLElement, name: string) {
  const element = container.querySelector(`[data-part="${name}"]`);
  if (!(element instanceof HTMLElement)) throw new Error(`${name} not found`);
  return element;
}

afterEach(() => {
  vi.useRealTimers();
});

describe('EnvelopeReveal', () => {
  it('calls onDone when the card animation ends', () => {
    const onDone = vi.fn();
    const { container } = render(<EnvelopeReveal onDone={onDone} />);

    fireEvent.animationEnd(part(container, 'card'));

    expect(onDone).toHaveBeenCalledOnce();
  });

  it('ignores the end of the flap animation', () => {
    const onDone = vi.fn();
    const { container } = render(<EnvelopeReveal onDone={onDone} />);

    fireEvent.animationEnd(part(container, 'flap'));

    expect(onDone).not.toHaveBeenCalled();
  });

  it.each(['Enter', 'Escape'])('skips to the end with %s', async (key) => {
    const onDone = vi.fn();
    render(<EnvelopeReveal onDone={onDone} />);

    await userEvent.keyboard(`{${key}}`);

    expect(onDone).toHaveBeenCalledOnce();
  });

  it('skips to the end on click', async () => {
    const onDone = vi.fn();
    const { container } = render(<EnvelopeReveal onDone={onDone} />);

    await userEvent.click(part(container, 'card'));

    expect(onDone).toHaveBeenCalledOnce();
  });

  it('calls onDone once when several triggers arrive', async () => {
    const onDone = vi.fn();
    const { container } = render(<EnvelopeReveal onDone={onDone} />);

    fireEvent.animationEnd(part(container, 'card'));
    await userEvent.keyboard('{Enter}');

    expect(onDone).toHaveBeenCalledOnce();
  });

  it('ends by itself when no animation end arrives', () => {
    vi.useFakeTimers();
    const onDone = vi.fn();
    render(<EnvelopeReveal onDone={onDone} />);

    vi.advanceTimersByTime(REVEAL_FALLBACK_MS - 1);
    expect(onDone).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);

    expect(onDone).toHaveBeenCalledOnce();
  });

  it('fades instead of moving for visitors who ask for reduced motion', () => {
    const { container } = render(<EnvelopeReveal onDone={vi.fn()} />);

    expect(part(container, 'card')).toHaveClass(
      'motion-reduce:animate-fade-in',
    );
    expect(part(container, 'flap')).toHaveClass('motion-reduce:hidden');
  });
});
