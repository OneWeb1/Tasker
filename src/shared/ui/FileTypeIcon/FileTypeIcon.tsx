import { getFileKind, getFileLabel } from '@/shared/lib/utils/fileType';
import type { FileKind } from '@/shared/lib/utils/fileType';

interface FileTypeIconProps {
  name: string;
  type?: string;
  size?: number;
}

const KIND_COLORS: Record<FileKind, string> = {
  pdf: '#e5484d',
  document: '#3b82f6',
  sheet: '#22a06b',
  presentation: '#f08c2e',
  archive: '#b7791f',
  audio: '#8b5cf6',
  video: '#ec4899',
  image: '#14b8a6',
  code: '#64748b',
  text: '#94a3b8',
  other: '#7c8799',
};

export function FileTypeIcon({ name, type, size = 40 }: FileTypeIconProps) {
  const color = KIND_COLORS[getFileKind(name, type)];
  const label = getFileLabel(name);

  return (
    <svg
      width={size}
      height={(size * 56) / 48}
      viewBox="0 0 48 56"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M8 2h22l12 12v38a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3z"
        fill={color}
        fillOpacity={0.16}
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <path d="M30 2v9a3 3 0 0 0 3 3h9z" fill={color} fillOpacity={0.45} />
      <rect x="11" y="31" width="26" height="12" rx="3" fill={color} />
      <text
        x="24"
        y="40"
        textAnchor="middle"
        fill="#ffffff"
        fontSize={label.length > 3 ? 7.5 : 9}
        fontWeight={700}
        fontFamily="inherit"
      >
        {label}
      </text>
    </svg>
  );
}