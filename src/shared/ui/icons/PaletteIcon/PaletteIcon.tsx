import type { SVGProps } from 'react';

export function PaletteIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.8-.8 1.8-1.7 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-.9.8-1.7 1.7-1.7H16a5 5 0 0 0 5-5c0-4.4-4-7.2-9-7.2Z" />
      <circle cx="7.5" cy="11.5" r="1" />
      <circle cx="10" cy="7.5" r="1" />
      <circle cx="15" cy="7.5" r="1" />
    </svg>
  );
}