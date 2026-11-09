import type { SVGProps } from 'react';

export function StatusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="8.5" strokeDasharray="3.2 3.2" />
    </svg>
  );
}