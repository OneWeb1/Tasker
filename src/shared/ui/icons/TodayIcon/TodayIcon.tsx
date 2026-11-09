import type { SVGProps } from 'react';

interface TodayIconProps extends SVGProps<SVGSVGElement> {
  filled?: boolean;
}

export function TodayIcon({ filled = true, ...props }: TodayIconProps) {
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
      {filled ? (
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M8 2a1 1 0 0 1 1 1v1h6V3a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v11a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h1V3a1 1 0 0 1 1-1ZM5 9v1.5h14V9H5Z"
        />
      ) : (
        <>
          <rect x="3.5" y="4.5" width="17" height="16" rx="3" />
          <path d="M8 2.5v4M16 2.5v4M3.5 10h17" />
        </>
      )}
    </svg>
  );
}