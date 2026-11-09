import { useId } from 'react';
import type { SVGProps } from 'react';

export function DefaultAvatar(props: SVGProps<SVGSVGElement>) {
  const uid = useId().replace(/:/g, '');
  const bgId = `${uid}-bg`;
  const bodyId = `${uid}-body`;

  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 96 96"
      aria-hidden="true"
      focusable="false"
      style={{ display: 'block' }}
      {...props}
    >
      <defs>
        <linearGradient id={bgId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8e9bff" />
          <stop offset="1" stopColor="#5a4fcf" />
        </linearGradient>
        <linearGradient id={bodyId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#dfe3ff" />
        </linearGradient>
      </defs>
      <rect width="96" height="96" fill={`url(#${bgId})`} />
      <path d="M10 96c0-17 13-27 38-27s38 10 38 27Z" fill="#2b2f45" />
      <path d="M36 70l12 16 12-16-5-4H41Z" fill="#ffffff" />
      <path d="M48 76l-3 4 3 14 3-14Z" fill={`url(#${bodyId})`} opacity="0.0" />
      <rect x="42" y="56" width="12" height="13" rx="5" fill="#e8b996" />
      <ellipse cx="48" cy="40" rx="15" ry="17" fill="#f2c9a8" />
      <path d="M32.5 38c-1-12 6-20 16-20s16.5 7 15 20c-2-6-5-9-9-10-6 3-14 3-22 10Z" fill="#3b2a22" />
      <circle cx="42.5" cy="42" r="1.6" fill="#3b2a22" />
      <circle cx="53.5" cy="42" r="1.6" fill="#3b2a22" />
      <path d="M43 49c2.8 2.4 7.2 2.4 10 0" fill="none" stroke="#a8644a" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}