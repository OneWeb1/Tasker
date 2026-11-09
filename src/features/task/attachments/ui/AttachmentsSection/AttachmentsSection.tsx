import { useId } from 'react';
import { useTaskDiff } from '@/entities/task';
import type { Task } from '@/entities/task';
import { ChevronDownIcon } from '@/shared/ui/icons';
import { useAttachmentsSection } from '../../model/hooks/useAttachmentsSection';
import { AttachmentActionsSheet } from '../AttachmentActionsSheet';
import { AttachmentItem } from '../AttachmentItem';
import { AttachmentPreviewSheet } from '../AttachmentPreviewSheet';
import { AttachmentSelectionBar } from '../AttachmentSelectionBar';
import { AttachmentUpload } from '../AttachmentUpload';
import { DeleteAttachmentsSheet } from '../DeleteAttachmentsSheet';
import styles from './AttachmentsSection.module.css';

interface AttachmentsSectionProps {
  task: Task;
}

export function AttachmentsSection({ task }: AttachmentsSectionProps) {
  const section = useAttachmentsSection(task);
  const isReadOnly = useTaskDiff() !== null;
  const listId = useId();

  return (
    <section
      className={styles.section}
      data-selecting={section.isSelecting || undefined}
      aria-label="Вкладення"
    >
      <button
        type="button"
        className={styles.header}
        aria-expanded={section.isExpanded}
        aria-controls={listId}
        onClick={section.toggleExpanded}
      >
        <span className={styles.title}>Вкладення</span>
        <ChevronDownIcon
          className={styles.chevron}
          data-expanded={section.isExpanded}
          width={22}
          height={22}
        />
      </button>

      <div id={listId} className={styles.content} hidden={!section.isExpanded}>
        {section.isSelecting && (
          <AttachmentSelectionBar
            count={section.selectedCount}
            onDownload={section.downloadSelected}
            onDelete={section.deleteSelected}
            onCancel={section.cancelSelection}
          />
        )}

        {section.attachments.length > 0 && (
          <ul className={styles.list}>
            {section.attachments.map((attachment) => (
              <AttachmentItem
                key={attachment.id}
                attachment={attachment}
                isSelecting={section.isSelecting}
                isSelected={section.isSelected(attachment.id)}
                isReadOnly={isReadOnly}
                onOpen={section.openAttachment}
                onOpenMenu={section.openMenu}
              />
            ))}
          </ul>
        )}

        <AttachmentUpload
          error={section.error}
          canAdd={!section.isSelecting && !isReadOnly}
          onFiles={section.uploadFiles}
        />
      </div>

      {section.active && (
        <>
          <AttachmentPreviewSheet
            attachment={section.active}
            isOpen={section.isPreviewOpen}
            onClose={section.closeSheet}
            onDownload={section.downloadActive}
          />
          <AttachmentActionsSheet
            attachment={section.active}
            isOpen={section.isMenuOpen}
            onClose={section.closeSheet}
            onDownload={section.downloadActiveAndClose}
            onSelect={section.selectActive}
            onDelete={section.deleteActive}
          />
        </>
      )}
      <DeleteAttachmentsSheet
        isOpen={section.isDeleteOpen}
        count={section.deleteCount}
        onClose={section.closeSheet}
        onConfirm={section.confirmDelete}
      />
    </section>

  );
}