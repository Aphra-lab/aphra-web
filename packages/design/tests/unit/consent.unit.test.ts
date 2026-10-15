import { act, renderHook } from '@testing-library/react';

import { AGE_CONSENT_KEY, leaveSite, useAgeConsent } from '@aphralab/design';
import type { LeaveSiteWindow } from '../../src/consent/leaveSite';

afterEach(() => {
  vi.restoreAllMocks();
  window.localStorage.clear();
});

describe('useAgeConsent', () => {
  it('starts without consent and remembers OUI', () => {
    const { result } = renderHook(() => useAgeConsent());
    expect(result.current.accepted).toBe(false);

    act(() => result.current.accept());

    expect(result.current.accepted).toBe(true);
    expect(window.localStorage.getItem(AGE_CONSENT_KEY)).toMatch(
      /^\d{4}-\d{2}-\d{2}T/,
    );
  });

  it('starts with consent when it is stored', () => {
    window.localStorage.setItem(AGE_CONSENT_KEY, '2026-09-30T10:00:00.000Z');

    expect(renderHook(() => useAgeConsent()).result.current.accepted).toBe(
      true,
    );
  });

  it('treats a storage read error as no consent', () => {
    vi.spyOn(window.localStorage, 'getItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError');
    });

    expect(renderHook(() => useAgeConsent()).result.current.accepted).toBe(
      false,
    );
  });

  it('accepts for this visit when storage cannot be written', () => {
    vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => {
      throw new DOMException('full', 'QuotaExceededError');
    });
    const { result } = renderHook(() => useAgeConsent());

    act(() => result.current.accept());

    expect(result.current.accepted).toBe(true);
  });
});

function fakeWindow(referrer: string, historyLength: number) {
  const win: LeaveSiteWindow = {
    document: { referrer },
    history: { length: historyLength, back: vi.fn() },
    location: { origin: 'https://aphralab.com', replace: vi.fn() },
  };
  return win;
}

describe('leaveSite', () => {
  it('goes back when the visitor came from another site', () => {
    const win = fakeWindow('https://www.google.com/search?q=aphra', 2);

    leaveSite('about:blank', win);

    expect(win.history.back).toHaveBeenCalledOnce();
    expect(win.location.replace).not.toHaveBeenCalled();
  });

  it.each([
    ['no referrer', '', 2],
    ['a same-site referrer', 'https://aphralab.com/', 2],
    ['a malformed referrer', 'not a url', 2],
    ['no earlier history entry', 'https://www.google.com/', 1],
  ])('replaces the location with %s', (_case, referrer, historyLength) => {
    const win = fakeWindow(referrer, historyLength);

    leaveSite('https://example.org/', win);

    expect(win.location.replace).toHaveBeenCalledWith('https://example.org/');
    expect(win.history.back).not.toHaveBeenCalled();
  });

  it('uses about:blank by default', () => {
    const win = fakeWindow('', 1);

    leaveSite(undefined, win);

    expect(win.location.replace).toHaveBeenCalledWith('about:blank');
  });
});
