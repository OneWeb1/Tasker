import type { SVGProps } from 'react';

export function CopyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <rect x="9" y="9" width="11" height="11" rx="2.5" />
      <path d="M5 15V6.5A2.5 2.5 0 0 1 7.5 4H15" />
    </svg>
  );
}