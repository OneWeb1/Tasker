import type { SVGProps } from 'react';

export function WaveformIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M4 10v4M8 7v10M12 4v16M16 7v10M20 10v4" />
    </svg>
  );
}