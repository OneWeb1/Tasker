import type { SVGProps } from 'react';

export function HighlightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M14.5 4.5l5 5-8 8H6.5v-5z" />
      <path d="M4 21h16" />
    </svg>
  );
}