import type { ReactNode } from 'react';
import {
  AttachmentIcon,
  BulletListIcon,
  CameraIcon,
  ChecklistIcon,
  ChevronDownIcon,
  CodeIcon,
  FlagIcon,
  ImageIcon,
  NumberListIcon,
  QuoteIcon,
} from '@/shared/ui/icons';
import { NOTE_INSERT_SECTIONS, NOTE_MEDIA_ITEMS } from '../../model/constants/noteEditor';
import type { NoteInsertAction, NoteMediaSource } from '../../model/types/noteFormat';
import styles from './NoteInsertPanel.module.css';

interface NoteInsertPanelProps {
  onSelect: (action: NoteInsertAction) => void;
  onPickMedia: (source: NoteMediaSource) => void;
}

interface TileProps {
  label: string;
  onClick: () => void;
  children: ReactNode;
}

const heading = (level: number): ReactNode => (
  <span className={styles.heading} data-level={level}>
    H<sub>{level}</sub>
  </span>
);

const VISUALS: Record<NoteInsertAction, ReactNode> = {
  h1: heading(1),
  h2: heading(2),
  h3: heading(3),
  h4: heading(4),
  bullet: <BulletListIcon width={28} height={28} />,
  number: <NumberListIcon width={28} height={28} />,
  check: <ChecklistIcon width={28} height={28} />,
  codeBlock: <CodeIcon width={28} height={28} />,
  quote: <QuoteIcon width={28} height={28} />,
  callout: <FlagIcon width={28} height={28} />,
  table: (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M4 12h16M12 5v14" />
    </svg>
  ),
  toggle: <ChevronDownIcon width={28} height={28} />,
  divider: (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M4 12h16" />
    </svg>
  ),
};

const MEDIA_VISUALS: Record<NoteMediaSource, ReactNode> = {
  gallery: <ImageIcon width={28} height={28} />,
  camera: <CameraIcon width={28} height={28} />,
  file: <AttachmentIcon width={28} height={28} />,
};

function Tile({ label, onClick, children }: TileProps) {
  return (
    <button type="button" className={styles.tile} onClick={onClick}>
      <span className={styles.visual}>{children}</span>
      <span className={styles.label}>{label}</span>
    </button>
  );
}

export function NoteInsertPanel({ onSelect, onPickMedia }: NoteInsertPanelProps) {
  return (
    <div className={styles.panel}>
      {NOTE_INSERT_SECTIONS.map((section) => (
        <section key={section.title} className={styles.section}>
          <h3 className={styles.title}>{section.title}</h3>
          <div className={styles.grid}>
            {section.items.map((item) => (
              <Tile key={item.action} label={item.label} onClick={() => onSelect(item.action)}>
                {VISUALS[item.action]}
              </Tile>
            ))}
          </div>
        </section>
      ))}
      <section className={styles.section}>
        <h3 className={styles.title}>Медіа</h3>
        <div className={styles.grid}>
          {NOTE_MEDIA_ITEMS.map((item) => (
            <Tile key={item.source} label={item.label} onClick={() => onPickMedia(item.source)}>
              {MEDIA_VISUALS[item.source]}
            </Tile>
          ))}
        </div>
      </section>
    </div>
  );
}