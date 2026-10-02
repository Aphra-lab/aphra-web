import { useCallback, useEffect, useRef, type AnimationEvent } from 'react';

import { Envelope } from '../Envelope/Envelope';

export const REVEAL_FALLBACK_MS = 2500;

export interface EnvelopeRevealProps {
  onDone: () => void;
}

export function EnvelopeReveal({ onDone }: EnvelopeRevealProps) {
  const onDoneRef = useRef(onDone);
  const finished = useRef(false);

  useEffect(() => {
    onDoneRef.current = onDone;
  });

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    onDoneRef.current();
  }, []);

  useEffect(() => {
    const skipOnKey = (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === 'Escape') finish();
    };
    const fallback = window.setTimeout(finish, REVEAL_FALLBACK_MS);
    window.addEventListener('keydown', skipOnKey);
    return () => {
      window.clearTimeout(fallback);
      window.removeEventListener('keydown', skipOnKey);
    };
  }, [finish]);

  const onCardEnd = (event: AnimationEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) finish();
  };

  return (
    <div className="w-full max-w-[566px] cursor-pointer" onClick={finish}>
      <Envelope state="opening" onCardAnimationEnd={onCardEnd} />
      <p role="status" className="sr-only">
        Ouverture de l'enveloppe
      </p>
    </div>
  );
}
