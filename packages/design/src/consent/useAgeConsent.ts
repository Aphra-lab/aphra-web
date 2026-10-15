import { useCallback, useState } from 'react';

export const AGE_CONSENT_KEY = 'aphra.age-consent';

function readConsent() {
  try {
    return window.localStorage.getItem(AGE_CONSENT_KEY) !== null;
  } catch {
    return false;
  }
}

function writeConsent() {
  try {
    window.localStorage.setItem(AGE_CONSENT_KEY, new Date().toISOString());
  } catch {
    // Storage blocked: consent lasts for this visit only.
  }
}

export function useAgeConsent() {
  const [accepted, setAccepted] = useState(readConsent);
  const accept = useCallback(() => {
    writeConsent();
    setAccepted(true);
  }, []);
  return { accepted, accept };
}
