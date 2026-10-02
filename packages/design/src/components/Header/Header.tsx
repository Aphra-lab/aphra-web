import { cn } from '../../utils/cn';
import { BottleCounter } from '../BottleCounter/BottleCounter';
import { Logo } from '../Logo/Logo';
import { Text } from '../Text/Text';
import { TAGLINE } from './tagline';

export interface HeaderProps {
  menuOpen: boolean;
  onMenuToggle: () => void;
  bottlesSold?: number;
  className?: string;
}

export function Header({
  menuOpen,
  onMenuToggle,
  bottlesSold,
  className,
}: HeaderProps) {
  return (
    <header
      className={cn(
        'grid grid-cols-[1fr_auto_1fr] items-start gap-4 pt-12',
        className,
      )}
    >
      <button
        type="button"
        aria-expanded={menuOpen}
        onClick={onMenuToggle}
        className="justify-self-start pt-6 font-mono text-nav text-ink outline-none focus-visible:outline-1 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ink md:pt-10"
      >
        MENU
      </button>
      <div className="flex flex-col items-center gap-4">
        <Logo variant="wordmark" className="h-12 md:h-20" />
        <Text variant="caption" className="text-center">
          {TAGLINE[0]}
          <br />
          {TAGLINE[1]}
        </Text>
      </div>
      <BottleCounter
        value={bottlesSold}
        className="justify-self-end pt-6 md:pt-10"
      />
    </header>
  );
}
