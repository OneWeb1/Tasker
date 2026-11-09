import type { SVGProps } from 'react';

interface ProfileIconProps extends SVGProps<SVGSVGElement> {
  filled?: boolean;
}

export function ProfileIcon({ filled = true, ...props }: ProfileIconProps) {
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
        <>
          <circle cx="12" cy="8" r="4.5" />
          <path d="M12 14.5c-4.4 0-8 2-8 4.7 0 1 .8 1.8 1.8 1.8h12.4c1 0 1.8-.8 1.8-1.8 0-2.7-3.6-4.7-8-4.7Z" />
        </>
      ) : (
        <>
          <circle cx="12" cy="8" r="3.75" />
          <path d="M4.5 19.2c0-2.4 3.4-4 7.5-4s7.5 1.6 7.5 4c0 .6-.5 1.1-1.1 1.1H5.6c-.6 0-1.1-.5-1.1-1.1Z" />
        </>
      )}
    </svg>
  );
}