import wordmark from '../../../assets/logo-wordmark.svg?url';
import wordmarkMoon from '../../../assets/logo-wordmark-moon.svg?url';
import { MaskImage } from '../MaskImage/MaskImage';

export const LOGO_FILES = {
  wordmark: { src: wordmark, ratio: 879.63 / 400.47 },
  'wordmark-moon': { src: wordmarkMoon, ratio: 1015.59 / 494.41 },
} as const;

export type LogoVariant = keyof typeof LOGO_FILES;

export interface LogoProps {
  variant?: LogoVariant;
  className?: string;
}

export function Logo({ variant = 'wordmark', className }: LogoProps) {
  const file = LOGO_FILES[variant];
  return (
    <MaskImage
      src={file.src}
      aspectRatio={file.ratio}
      label="Aphra"
      className={className ?? 'h-16'}
    />
  );
}
