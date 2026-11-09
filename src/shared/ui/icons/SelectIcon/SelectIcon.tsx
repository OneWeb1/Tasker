import type { SVGProps } from 'react';

export function SelectIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <path d="M8 12.5l3 3 5-6" />
    </svg>
  );
}