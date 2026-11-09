import type { SVGProps } from 'react';

interface NotesIconProps extends SVGProps<SVGSVGElement> {
  filled?: boolean;
}

export function NotesIcon({ filled = true, ...props }: NotesIconProps) {
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
          d="M7 2h10a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3Zm1 5.25v1.5h8v-1.5H8Zm0 4v1.5h8v-1.5H8Zm0 4v1.5h5v-1.5H8Z"
        />
      ) : (
        <>
          <rect x="4.5" y="2.5" width="15" height="19" rx="3" />
          <path d="M8.5 8h7M8.5 12h7M8.5 16h4" />
        </>
      )}
    </svg>
  );
}