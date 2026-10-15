import { MaskImage } from '../MaskImage/MaskImage';
import { LOGO_FILES } from './logo-files';
import type { LogoVariant } from './logo-files';

export type { LogoVariant };

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
