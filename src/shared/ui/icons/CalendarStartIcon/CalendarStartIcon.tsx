import type { SVGProps } from 'react';

export function CalendarStartIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <rect x="3" y="5" width="18" height="16" rx="4" />
      <path d="M8 2.5v4M16 2.5v4" />
      <rect x="7" y="10" width="4" height="4" rx="1" fill="currentColor" stroke="none" />
    </svg>
  );
}