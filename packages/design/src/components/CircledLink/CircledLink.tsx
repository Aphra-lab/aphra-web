import type { AnchorHTMLAttributes } from 'react';

import { Slot, Slottable } from '@radix-ui/react-slot';

import { cn } from '../../utils/cn';
import { ELLIPSES } from './ellipses';
import type { CircledLinkShape } from './ellipses';

export type { CircledLinkShape };

export interface CircledLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  asChild?: boolean;
  shape?: CircledLinkShape;
}

export function CircledLink({
  asChild = false,
  shape = 1,
  className,
  children,
  ...props
}: CircledLinkProps) {
  const Component = asChild ? Slot : 'a';

  return (
    <Component
      className={cn(
        'group relative inline-block text-ink outline-none focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-ink',
        className,
      )}
      {...props}
    >
      <Slottable>{children}</Slottable>
      <svg
        aria-hidden="true"
        viewBox="0 0 130 40"
        preserveAspectRatio="none"
        className="pointer-events-none absolute -top-2 -left-3 h-[calc(100%+1rem)] w-[calc(100%+1.5rem)] overflow-visible"
      >
        <path
          d={ELLIPSES[shape]}
          vectorEffect="non-scaling-stroke"
          className="fill-none stroke-ink stroke-1 group-focus-visible:stroke-2"
        />
      </svg>
    </Component>
  );
}
