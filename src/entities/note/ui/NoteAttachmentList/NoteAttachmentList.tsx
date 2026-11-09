import { useMemo, useState } from 'react';
import { useBlobUrl } from '@/shared/lib/hooks/useBlobUrl';
import { decodeFileName } from '@/shared/lib/utils/fileName';
import { FileTypeIcon } from '@/shared/ui/FileTypeIcon';
import { ArrowLeftIcon, ArrowRightIcon, CloseIcon } from '@/shared/ui/icons';
import { groupNoteAttachments } from '../../lib/noteAttachmentGroups';
import type { NoteAttachment } from '../../model/types/note';
import { NoteAttachmentViewer } from '../NoteAttachmentViewer';
import { NoteAttachmentGroup } from './NoteAttachmentGroup';
import { NoteAttachmentCaption } from './NoteAttachmentCaption';
import styles from './NoteAttachmentList.module.css';
import { NoteAttachmentPlaceholder } from './NoteAttachmentPlaceholder';
import type { NoteAttachmentPlaceholderProps } from './NoteAttachmentPlaceholder';

interface NoteAttachmentListProps {
  attachments: readonly NoteAttachment[];
  error?: string | null;
  placeholder?: NoteAttachmentPlaceholderProps;
  onRemove?: (id: string) => void;
  onRenameGroup?: (groupId: string, title: string) => void;
  onCaptionChange?: (id: string, caption: string) => void;
  onMove?: (id: string, direction: -1 | 1) => void;
}

function AttachmentThumb({ item }: { item: NoteAttachment }) {
  const isImage = item.type.startsWith('image/');
  const isVideo = item.type.startsWith('video/');
  const url = useBlobUrl(isImage || isVideo ? item.blobId : undefined);

  if (isImage) {
    return url ? <img className={styles.media} src={url} alt="" loading="lazy" /> : null;
  }
  if (isVideo) {
    if (url === null) return null;
    return (
      <>
        <video className={styles.media} src={url} preload="metadata" muted playsInline />
        <span className={styles.play} aria-hidden="true" />
      </>
    );
  }
  const name = decodeFileName(item.name);
  return (
    <span className={styles.file}>
      <FileTypeIcon name={name} type={item.type} size={40} />
      <span className={styles.name}>{name}</span>
    </span>
  );
}

export function NoteAttachmentList({
  attachments,
  error,
  placeholder,
  onRemove,
  onRenameGroup,
  onCaptionChange,
  onMove,
}: NoteAttachmentListProps) {
  const [openedId, setOpenedId] = useState<string | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const groups = useMemo(() => groupNoteAttachments(attachments), [attachments]);

  if (attachments.length === 0 && !error) {
    return placeholder ? <NoteAttachmentPlaceholder {...placeholder} /> : null;
  }

  const opened = attachments.find((item) => item.id === openedId) ?? null;

  const open = (id: string) => {
    setOpenedId(id);
    setIsViewerOpen(true);
  };

  return (
    <div className={styles.root}>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      {groups.map((group) => (
        <NoteAttachmentGroup
          key={group.id ?? 'ungrouped'}
          id={group.id}
          title={group.title}
          onRename={onRenameGroup}
        >
          <ul className={styles.grid}>
            {group.items.map((item, index) => (
              <li key={item.id} className={styles.cell}>
                <button
                  type="button"
                  className={styles.thumb}
                  aria-label={`Відкрити вкладення: ${decodeFileName(item.name)}`}
                  onClick={() => open(item.id)}
                >
                  <AttachmentThumb item={item} />
                </button>
                {onRemove && (
                  <button
                    type="button"
                    className={styles.remove}
                    aria-label={`Видалити вкладення: ${decodeFileName(item.name)}`}
                    onClick={() => onRemove(item.id)}
                  >
                    <CloseIcon width={12} height={12} strokeWidth={3} />
                  </button>
                )}
                <NoteAttachmentCaption
                  value={item.caption ?? ''}
                  label={`Підпис до вкладення: ${decodeFileName(item.name)}`}
                  onChange={onCaptionChange && ((caption) => onCaptionChange(item.id, caption))}
                />
                {onMove && group.items.length > 1 && (
                  <div className={styles.controls}>
                    <button
                      type="button"
                      className={styles.move}
                      disabled={index === 0}
                      aria-label={`Перемістити раніше: ${decodeFileName(item.name)}`}
                      onClick={() => onMove(item.id, -1)}
                    >
                      <ArrowLeftIcon width={16} height={16} />
                    </button>
                    <button
                      type="button"
                      className={styles.move}
                      disabled={index === group.items.length - 1}
                      aria-label={`Перемістити пізніше: ${decodeFileName(item.name)}`}
                      onClick={() => onMove(item.id, 1)}
                    >
                      <ArrowRightIcon width={16} height={16} />
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </NoteAttachmentGroup>
      ))}
      <NoteAttachmentViewer
        attachment={opened}
        isOpen={isViewerOpen && opened !== null}
        onClose={() => setIsViewerOpen(false)}
      />
    </div>
  );
}