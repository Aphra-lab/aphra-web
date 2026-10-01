import { useId, useState, type ReactNode } from 'react';

import { leaveSite } from '../../consent/leaveSite';
import { useAgeConsent } from '../../consent/useAgeConsent';
import { Envelope } from '../Envelope/Envelope';
import { EnvelopeReveal } from '../EnvelopeReveal/EnvelopeReveal';
import { HealthWarning } from '../HealthWarning/HealthWarning';

export const AGE_DECLARATION =
  "Je déclare sur l'honneur avoir l'âge légal afin de consulter le site aphralab.com selon les lois en vigueur dans mon pays.";

const BUTTON =
  'px-2 font-mono text-nav text-ink outline-none focus-visible:outline-1 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ink';

export function GateScreen({
  children,
  labelledBy,
}: {
  children: ReactNode;
  labelledBy?: string;
}) {
  const dialog = labelledBy
    ? { role: 'dialog', 'aria-modal': true, 'aria-labelledby': labelledBy }
    : {};
  return (
    <div
      {...dialog}
      className="flex min-h-screen flex-col items-center justify-center gap-8 bg-black px-4 py-12"
    >
      {children}
      <HealthWarning tone="black" className="text-center" />
    </div>
  );
}

export interface AgeGateProps {
  children: ReactNode;
  exitUrl?: string;
}

export function AgeGate({ children, exitUrl = 'about:blank' }: AgeGateProps) {
  const { accepted, accept } = useAgeConsent();
  const [revealing, setRevealing] = useState(false);
  const titleId = useId();

  if (revealing) {
    return (
      <GateScreen>
        <EnvelopeReveal onDone={() => setRevealing(false)} />
      </GateScreen>
    );
  }
  if (accepted) return <>{children}</>;

  const onYes = () => {
    accept();
    setRevealing(true);
  };

  return (
    <GateScreen labelledBy={titleId}>
      <div className="w-full max-w-[566px]">
        <Envelope state="closed">
          <div className="flex flex-col items-center gap-3 border border-ink bg-paper px-3 py-2 text-center">
            <p
              id={titleId}
              className="font-mono text-caption text-ink uppercase"
            >
              {AGE_DECLARATION}
            </p>
            <div className="flex gap-12">
              <button
                type="button"
                autoFocus
                onClick={onYes}
                className={BUTTON}
              >
                OUI
              </button>
              <button
                type="button"
                onClick={() => leaveSite(exitUrl)}
                className={BUTTON}
              >
                NON
              </button>
            </div>
          </div>
        </Envelope>
      </div>
    </GateScreen>
  );
}
