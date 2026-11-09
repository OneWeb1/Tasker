import type { SVGProps } from 'react';

interface ProjectsIconProps extends SVGProps<SVGSVGElement> {
  filled?: boolean;
}

export function ProjectsIcon({ filled = true, ...props }: ProjectsIconProps) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke={filled ? undefined : 'currentColor'}
      strokeWidth={filled ? undefined : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M3.5 7a3 3 0 0 1 3-3h2.7a2 2 0 0 1 1.5.7L12 6h5.5a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-11a3 3 0 0 1-3-3V7Z" />
    </svg>
  );
}