import type { SVGProps } from 'react';

export function CameraIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M13 19.5H6.5A2.5 2.5 0 0 1 4 17V9a2.5 2.5 0 0 1 2.5-2.5h1.4l1-1.6a1.5 1.5 0 0 1 1.3-.7h3.6a1.5 1.5 0 0 1 1.3.7l1 1.6h1.4A2.5 2.5 0 0 1 20 9v3" />
      <circle cx="12" cy="12.5" r="3" />
      <path d="M19 15v6M16 18h6" />
    </svg>
  );
}