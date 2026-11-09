import type { SVGProps } from 'react';

export function SortAlphaIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d="M3.5 10 6 4l2.5 6M4.5 8h3" />
      <path d="M3.5 14h5l-5 6h5" />
      <path d="M16 4v16M12.5 16.5 16 20l3.5-3.5" />
    </svg>
  );
}