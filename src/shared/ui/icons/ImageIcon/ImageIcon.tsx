import type { SVGProps } from 'react';

export function ImageIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <rect x="4" y="5" width="16" height="14" rx="3" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="m20 16-4.5-4.5L7 19" />
    </svg>
  );
}