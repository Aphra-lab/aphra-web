import { cn } from '../../utils/cn';

const DIGITS = 6;
const PLACEHOLDER = '—'.repeat(DIGITS);
const LOADING = 'Nombre de bouteilles vendues en cours de chargement';
const frenchNumber = new Intl.NumberFormat('fr-FR');

function isCount(value: number | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

export interface BottleCounterProps {
  value?: number;
  className?: string;
}

export function BottleCounter({ value, className }: BottleCounterProps) {
  const classes = cn('font-mono text-nav tabular-nums text-ink', className);

  if (!isCount(value)) {
    return (
      <p aria-busy="true" className={classes}>
        <span aria-hidden="true">{PLACEHOLDER}</span>
        <span className="sr-only">{LOADING}</span>
      </p>
    );
  }

  const count = Math.trunc(value);
  const noun = count <= 1 ? 'bouteille vendue' : 'bouteilles vendues';
  return (
    <p className={classes}>
      <span aria-hidden="true">{String(count).padStart(DIGITS, '0')}</span>
      <span className="sr-only">{`${frenchNumber.format(count)} ${noun}`}</span>
    </p>
  );
}
