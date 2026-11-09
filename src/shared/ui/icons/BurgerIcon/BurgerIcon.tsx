import type { SVGProps } from 'react';

export function BurgerIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M4 9h16" />
      <path d="M4 15h10" />
    </svg>
  );
}