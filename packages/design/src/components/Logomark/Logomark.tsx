import { MaskImage } from '../MaskImage/MaskImage';
import { LOGOMARK_FILES } from './logomark-files';
import type { LogomarkFace } from './logomark-files';

export type { LogomarkFace };

export interface LogomarkProps {
  face?: LogomarkFace;
  decorative?: boolean;
  className?: string;
}

export function Logomark({
  face = 1,
  decorative = false,
  className,
}: LogomarkProps) {
  const file = LOGOMARK_FILES[face];
  return (
    <MaskImage
      src={file.src}
      aspectRatio={file.ratio}
      label={decorative ? undefined : 'Aphra'}
      className={className ?? 'h-16'}
    />
  );
}
