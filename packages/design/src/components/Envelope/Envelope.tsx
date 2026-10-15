import { useId, type AnimationEventHandler, type ReactNode } from 'react';

import { cn } from '../../utils/cn';
import { Logo } from '../Logo/Logo';
import { Logomark } from '../Logomark/Logomark';

export type EnvelopeState = 'closed' | 'opening';

export interface EnvelopeProps {
  state: EnvelopeState;
  children?: ReactNode;
  onCardAnimationEnd?: AnimationEventHandler<HTMLDivElement>;
}

const WIDTH = 566;
const HEIGHT = 773;
const FLAP = 228;
const LINE = 'fill-none stroke-ink';
const FLAP_PATH = `M0.5 0.5 H${WIDTH - 0.5} V${FLAP - 28} Q${WIDTH - 0.5} ${FLAP - 0.5} ${WIDTH - 28} ${FLAP - 0.5} H28 Q0.5 ${FLAP - 0.5} 0.5 ${FLAP - 28} Z`;

function Grain({ id, y, height }: { id: string; y: number; height: number }) {
  return (
    <>
      <filter id={id}>
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.85"
          numOctaves={3}
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect
        x={0}
        y={y}
        width={WIDTH}
        height={height}
        filter={`url(#${id})`}
        opacity={0.06}
      />
    </>
  );
}

function Eyelet({ x, y }: { x: number; y: number }) {
  return (
    <g className="fill-paper stroke-ink" strokeWidth={1}>
      <circle cx={x} cy={y} r={44} />
      <circle cx={x} cy={y} r={9} />
      <circle cx={x} cy={y} r={4.5} className="fill-ink" />
    </g>
  );
}

export function Envelope({
  state,
  children,
  onCardAnimationEnd,
}: EnvelopeProps) {
  const grainId = `aphra-grain-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const opening = state === 'opening';

  return (
    <div className="relative aspect-[566/773] w-full perspective-distant">
      <svg
        aria-hidden="true"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="absolute inset-0 size-full"
      >
        <rect
          x={0.5}
          y={0.5}
          width={WIDTH - 1}
          height={HEIGHT - 1}
          className="fill-paper stroke-ink"
          strokeWidth={1}
        />
        <Grain id={`${grainId}-back`} y={0} height={HEIGHT} />
      </svg>

      <div
        data-part="card"
        aria-hidden="true"
        onAnimationEnd={onCardAnimationEnd}
        className={cn(
          'absolute inset-x-[7%] top-[33%] flex h-[36%] items-center justify-center border border-ink bg-paper',
          opening &&
            'motion-safe:animate-card-rise motion-reduce:-translate-y-3/4 motion-reduce:animate-fade-in',
        )}
      >
        <Logo className="h-[30%]" />
      </div>

      <svg
        aria-hidden="true"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="absolute inset-0 size-full"
      >
        <rect
          x={0.5}
          y={FLAP}
          width={WIDTH - 1}
          height={HEIGHT - FLAP - 0.5}
          className="fill-paper stroke-ink"
          strokeWidth={1}
        />
        <Grain id={`${grainId}-pocket`} y={FLAP} height={HEIGHT - FLAP} />
        <path
          d="M268 322 L262 228 M292 322 L298 228"
          className={LINE}
          strokeWidth={1.2}
        />
        <path
          d="M280 336 C232 352 128 300 96 364 S62 470 38 494"
          className={LINE}
          strokeWidth={1.2}
          strokeLinecap="round"
        />
        <Eyelet x={280} y={330} />
      </svg>

      <div aria-hidden="true" className="absolute top-[31%] left-[66%] w-[28%]">
        <Logomark face="stamp" decorative className="w-full" />
      </div>

      <div
        data-part="flap"
        aria-hidden="true"
        className={cn(
          'absolute inset-x-0 top-0 h-[29.5%] origin-top [transform-style:preserve-3d]',
          opening && 'motion-safe:animate-flap-open motion-reduce:hidden',
        )}
      >
        <svg
          viewBox={`0 0 ${WIDTH} ${FLAP}`}
          className="absolute inset-0 size-full overflow-visible [backface-visibility:hidden]"
        >
          <path
            d={FLAP_PATH}
            className="fill-paper stroke-ink"
            strokeWidth={1}
          />
          <path
            d="M268 177 L264 227 M292 177 L296 227"
            className={LINE}
            strokeWidth={1.2}
          />
          <Eyelet x={280} y={165} />
        </svg>
        <svg
          viewBox={`0 0 ${WIDTH} ${FLAP}`}
          className="absolute inset-0 size-full [backface-visibility:hidden] [transform:rotateY(180deg)]"
        >
          <path
            d={FLAP_PATH}
            className="fill-paper stroke-ink"
            strokeWidth={1}
          />
        </svg>
      </div>

      {children && (
        <div className="absolute inset-x-[12%] bottom-[8%]">{children}</div>
      )}
    </div>
  );
}
