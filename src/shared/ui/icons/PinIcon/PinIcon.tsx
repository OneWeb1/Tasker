import type { SVGProps } from 'react';

export function PinIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d="M12 17v5M9 3h6l-1 6 3 3v2H7v-2l3-3-1-6z" />
    </svg>
  );
}