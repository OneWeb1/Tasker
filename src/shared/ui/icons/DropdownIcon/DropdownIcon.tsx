import type { SVGProps } from 'react';

export function DropdownIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M7.5 9.5H16.5L12 15.5Z" />
    </svg>
  );
}