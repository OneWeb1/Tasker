import type { SVGProps } from 'react';

export function SnowflakeIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9" />
      <path d="M9.5 4.5 12 6.5l2.5-2M9.5 19.5 12 17.5l2.5 2" />
    </svg>
  );
}