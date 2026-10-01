import type { CSSProperties } from 'react';

import { cn } from '../../utils/cn';

export interface MaskImageProps {
  src: string;
  aspectRatio: number;
  label?: string;
  className?: string;
}

export function MaskImage({
  src,
  aspectRatio,
  label,
  className,
}: MaskImageProps) {
  const style = {
    '--mask-src': `url("${src}")`,
    '--mask-ratio': String(aspectRatio),
  } as CSSProperties;
  const accessibility = label
    ? { role: 'img', 'aria-label': label }
    : { 'aria-hidden': true };

  return (
    <span
      {...accessibility}
      style={style}
      className={cn(
        'inline-block bg-current [aspect-ratio:var(--mask-ratio)] [mask-image:var(--mask-src)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]',
        className,
      )}
    />
  );
}
