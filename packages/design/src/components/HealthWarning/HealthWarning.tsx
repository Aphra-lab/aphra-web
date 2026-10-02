import { cn } from '../../utils/cn';

export const HEALTH_WARNING =
  "L'abus d'alcool est dangereux pour la santé, à consommer avec modération.";

const TONES = { paper: 'text-ink', black: 'text-paper' } as const;

export interface HealthWarningProps {
  tone?: keyof typeof TONES;
  className?: string;
}

export function HealthWarning({
  tone = 'paper',
  className,
}: HealthWarningProps) {
  return (
    <p className={cn('font-mono text-legal', TONES[tone], className)}>
      {HEALTH_WARNING}
    </p>
  );
}
