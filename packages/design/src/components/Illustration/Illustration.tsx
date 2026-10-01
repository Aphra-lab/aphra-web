import { ILLUSTRATION_SIZES } from '../../generated/asset-sizes';
import type { IllustrationName } from '../../tokens/recipes';

const FILES = import.meta.glob<string>('../../../assets/illustration-*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
});

function fileUrl(name: IllustrationName, variant: '480' | '960' | 'full') {
  const url = FILES[`../../../assets/illustration-${name}-${variant}.webp`];
  if (!url) throw new Error(`Missing illustration file ${name}-${variant}`);
  return url;
}

export interface IllustrationProps {
  name: IllustrationName;
  alt: string;
  sizes?: string;
  loading?: 'lazy' | 'eager';
  className?: string;
}

export function Illustration({
  name,
  alt,
  sizes = '(width < 48rem) 100vw, 480px',
  loading = 'lazy',
  className,
}: IllustrationProps) {
  const { width, height } = ILLUSTRATION_SIZES[name];
  const srcSet = [
    `${fileUrl(name, '480')} 480w`,
    `${fileUrl(name, '960')} 960w`,
    `${fileUrl(name, 'full')} ${width}w`,
  ].join(', ');

  return (
    <img
      src={fileUrl(name, '960')}
      srcSet={srcSet}
      sizes={sizes}
      width={width}
      height={height}
      alt={alt}
      loading={loading}
      decoding="async"
      className={className}
    />
  );
}
