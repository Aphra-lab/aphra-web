import type { ReactNode } from 'react';

import { cn } from '../../utils/cn';
import { HealthWarning } from '../HealthWarning/HealthWarning';

export interface LetterPageProps {
  header?: ReactNode;
  children: ReactNode;
  signOff?: ReactNode;
  address?: ReactNode;
  className?: string;
}

const MEASURE = 'mx-auto w-full max-w-measure font-mono text-body';

export function LetterPage({
  header,
  children,
  signOff,
  address,
  className,
}: LetterPageProps) {
  return (
    <div className={cn('min-h-screen bg-paper text-ink', className)}>
      <div className="mx-4 flex min-h-screen flex-col border-x border-ink px-4 md:mx-auto md:max-w-letter md:px-20">
        {header}
        <main className={cn(MEASURE, 'flex-1 space-y-6 py-24')}>
          {children}
        </main>
        {signOff && <div className={MEASURE}>{signOff}</div>}
        {address && (
          <address className={cn(MEASURE, 'py-16 not-italic')}>
            {address}
          </address>
        )}
        <footer className={cn(MEASURE, 'pb-8')}>
          <HealthWarning />
        </footer>
      </div>
    </div>
  );
}
