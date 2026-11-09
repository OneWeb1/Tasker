import type { SVGProps } from 'react';

interface AlignIconProps extends SVGProps<SVGSVGElement> {
  align: 'left' | 'center' | 'right';
}

const PATHS = {
  left: 'M4 6h16M4 10h10M4 14h16M4 18h10',
  center: 'M4 6h16M7 10h10M4 14h16M7 18h10',
  right: 'M4 6h16M10 10h10M4 14h16M10 18h10',
} as const;

export function AlignIcon({ align, ...props }: AlignIconProps) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d={PATHS[align]} />
    </svg>
  );
}