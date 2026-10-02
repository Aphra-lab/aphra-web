import signature from '../../../assets/signature.svg?url';
import { cn } from '../../utils/cn';
import { MaskImage } from '../MaskImage/MaskImage';
import { Text } from '../Text/Text';

export const SIGNATURE_RATIO = 240 / 90;

export interface SignatureProps {
  team?: boolean;
  className?: string;
}

export function Signature({ team = false, className }: SignatureProps) {
  return (
    <span className={cn('inline-flex flex-col items-start', className)}>
      <MaskImage
        src={signature}
        aspectRatio={SIGNATURE_RATIO}
        label="Aphra"
        className="h-12"
      />
      {team && (
        <Text as="span" className="-mt-3 ml-10">
          Aphra team.
        </Text>
      )}
    </span>
  );
}
