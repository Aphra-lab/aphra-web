import wordmark from '../../../assets/logo-wordmark.svg?url';
import wordmarkMoon from '../../../assets/logo-wordmark-moon.svg?url';

export const LOGO_FILES = {
  wordmark: { src: wordmark, ratio: 879.63 / 400.47 },
  'wordmark-moon': { src: wordmarkMoon, ratio: 1015.59 / 494.41 },
} as const;

export type LogoVariant = keyof typeof LOGO_FILES;
