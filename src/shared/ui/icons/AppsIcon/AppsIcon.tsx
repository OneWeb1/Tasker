import type { SVGProps } from 'react';

interface AppsIconProps extends SVGProps<SVGSVGElement> {
  filled?: boolean;
}

export function AppsIcon({ filled = true, ...props }: AppsIconProps) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke={filled ? undefined : 'currentColor'}
      strokeWidth={filled ? undefined : 1.8}
      aria-hidden="true"
      {...props}
    >
      <circle cx="7" cy="7" r="3" />
      <circle cx="17" cy="7" r="3" />
      <circle cx="7" cy="17" r="3" />
      <circle cx="17" cy="17" r="3" />
    </svg>
  );
}