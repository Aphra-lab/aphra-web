import face1 from '../../../assets/logomark-1.svg?url';
import face2 from '../../../assets/logomark-2.svg?url';
import face3 from '../../../assets/logomark-3.svg?url';
import face4 from '../../../assets/logomark-4.svg?url';
import face5 from '../../../assets/logomark-5.svg?url';
import face6 from '../../../assets/logomark-6.svg?url';
import stamp from '../../../assets/logomark-stamp.webp?url';
import { STAMP_SIZE } from '../../generated/asset-sizes';
import { MaskImage } from '../MaskImage/MaskImage';

const FACE_RATIO = 567.37 / 595.28;

export const LOGOMARK_FILES = {
  1: { src: face1, ratio: FACE_RATIO },
  2: { src: face2, ratio: FACE_RATIO },
  3: { src: face3, ratio: FACE_RATIO },
  4: { src: face4, ratio: FACE_RATIO },
  5: { src: face5, ratio: FACE_RATIO },
  6: { src: face6, ratio: FACE_RATIO },
  stamp: { src: stamp, ratio: STAMP_SIZE.width / STAMP_SIZE.height },
} as const;

export type LogomarkFace = keyof typeof LOGOMARK_FILES;

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
