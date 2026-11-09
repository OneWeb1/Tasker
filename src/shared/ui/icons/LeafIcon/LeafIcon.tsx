import type { SVGProps } from 'react';

export function LeafIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d="M19 5C10 6 5 11 5 19c8 0 14-5 14-14Z" />
      <path d="M5 19 13 11" />
    </svg>
  );
}