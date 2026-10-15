import type { ComponentPropsWithoutRef, ElementType } from 'react';

import { cn } from '../../utils/cn';

const VARIANTS = {
  body: 'font-mono text-body',
  caption: 'font-mono text-caption',
  nav: 'font-mono text-nav',
} as const;

export type TextVariant = keyof typeof VARIANTS;

export type TextProps<T extends ElementType = 'p'> = {
  as?: T;
  variant?: TextVariant;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'className'>;

export function Text<T extends ElementType = 'p'>({
  as,
  variant = 'body',
  className,
  ...props
}: TextProps<T>) {
  const Component: ElementType = as ?? 'p';
  return <Component className={cn(VARIANTS[variant], className)} {...props} />;
}
