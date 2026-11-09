import { TASK_SCHEDULES, TaskPatchContext, TaskPrioritySheet } from '@/entities/task';
import {
  DESCRIPTION_MAX_LENGTH,
  TITLE_FOCUS_DELAY_MS,
  WeekdayPicker,
} from '@/features/createItem';
import { NoteContentField } from '@/features/note/editNoteContent';
import { AttachmentsSection } from '@/features/task/attachments';
import { ChecklistsSection } from '@/features/task/checklists';
import { Button } from '@/shared/ui/Button';
import { EditableText } from '@/shared/ui/EditableText';
import type { TaskEditor } from '../../model/hooks/useTaskEditor';
import { DatesSheet } from '../DatesSheet';
import { NoteChips } from '../NoteChips';
import { OptionSheet } from '../OptionSheet';
import { SubtasksPanel } from '../SubtasksPanel';
import { TaskChips } from '../TaskChips';
import styles from './ItemEditor.module.css';

const SCHEDULE_OPTIONS = TASK_SCHEDULES.map(({ value, label }) => ({ value, label }));

interface ItemEditorProps {
  editor: TaskEditor;
}

export function ItemEditor({ editor }: ItemEditorProps) {
  const {
    kind,
    title,
    setTitle,
    description,
    setDescription,
    content,
    tags,
    addTag,
    removeTag,
    color,
    setColor,
    category,
    categories,
    selectedCategory,
    projects,
    project,
    projectId,
    workspaces,
    selectedWorkspace,
    dates,
    minDate,
    priority,
    schedule,
    scheduleLabel,
    isRecurring,
    weekdays,
    toggleWeekday,
    contentTask,
    patchDraft,
    isEditing,
    isSubmitting,
    hasError,
    isValid,
    handleSubmit,
    sheet,
    openSheet,
    closeSheet,
    openContent,
    changeDates,
    changePriority,
    changeProject,
    changeSchedule,
    changeCategory,
    changeWorkspace,
  } = editor;

  const categoryOptions = categories.map((item) => ({
    value: item.id,
    label: item.title,
    leading: <span aria-hidden="true">{item.emoji}</span>,
  }));

  const projectOptions = [
    { value: '', label: 'Без проєкту' },
    ...projects.map((item) => ({
      value: item.id,
      label: item.title,
      leading: <span aria-hidden="true">{item.emoji}</span>,
    })),
  ];

  const workspaceOptions = workspaces.map((item) => ({
    value: item.id,
    label: item.title,
    leading: <span aria-hidden="true">{item.emoji}</span>,
  }));

  const taskSections = (
    <>
      <div className={styles.section}>
        <SubtasksPanel task={contentTask} />
      </div>
      <div className={styles.section}>
        <ChecklistsSection task={contentTask} />
      </div>
      <div className={styles.section}>
        <AttachmentsSection task={contentTask} />
      </div>
    </>
  );

  return (
    <>
      <div className={styles.head}>
        <EditableText
          variant="title"
          label="Назва"
          placeholder={kind === 'note' ? 'Назва нотатки' : 'Що потрібно зробити?'}
          value={title}
          autoFocusDelay={TITLE_FOCUS_DELAY_MS}
          onChange={setTitle}
          onSave={setTitle}
        />
        {kind === 'task' && (
          <TaskChips
            task={{ ...dates, priority }}
            category={selectedCategory}
            project={project}
            workspace={selectedWorkspace}
            scheduleLabel={scheduleLabel}
            onOpenCategory={() => openSheet('category')}
            onOpenDates={() => openSheet('dates')}
            onOpenSchedule={() => openSheet('schedule')}
            onOpenPriority={() => openSheet('priority')}
            onOpenProject={() => openSheet('project')}
            onOpenWorkspace={() => openSheet('workspace')}
          />
        )}
        {kind === 'note' && (
          <NoteChips
            project={project}
            workspace={selectedWorkspace}
            tags={tags}
            color={color}
            onColorChange={setColor}
            onOpenProject={() => openSheet('project')}
            onOpenWorkspace={() => openSheet('workspace')}
            onAddTag={addTag}
            onRemoveTag={removeTag}
          />
        )}
      </div>

      {kind === 'task' ? (
        <>
          {schedule === 'weekly' && (
            <div className={styles.block}>
              <WeekdayPicker value={weekdays} onToggle={toggleWeekday} />
            </div>
          )}
          <div className={styles.description}>
            <EditableText
              variant="description"
              label="Опис завдання"
              placeholder="Додайте опис…"
              value={description}
              maxLength={DESCRIPTION_MAX_LENGTH}
              onChange={setDescription}
              onSave={setDescription}
            />
          </div>
        </>
      ) : (
        <div className={styles.description}>
          <NoteContentField value={content} onOpen={openContent} />
        </div>
      )}

      {kind === 'task' &&
        (isEditing ? (
          taskSections
        ) : (
          <TaskPatchContext.Provider value={patchDraft}>{taskSections}</TaskPatchContext.Provider>
        ))}

      {hasError && (
        <p className={styles.error} role="alert">
          Не вдалося зберегти. Спробуйте ще раз.
        </p>
      )}

      <form className={styles.footer} onSubmit={handleSubmit}>
        <Button type="submit" fullWidth disabled={!isValid || isSubmitting}>
          {isEditing ? 'Зберегти' : 'Створити'}
        </Button>
      </form>

      {kind === 'task' && (
        <>
          <DatesSheet
            value={dates}
            isRecurring={isRecurring}
            bounds={{ minDate }}
            isOpen={sheet === 'dates'}
            onClose={closeSheet}
            onSave={changeDates}
          />
          <OptionSheet
            isOpen={sheet === 'schedule'}
            title="Повторення"
            options={SCHEDULE_OPTIONS}
            value={schedule}
            onSelect={changeSchedule}
            onClose={closeSheet}
          />
          <TaskPrioritySheet
            isOpen={sheet === 'priority'}
            value={priority}
            onSelect={changePriority}
            onClose={closeSheet}
          />
          <OptionSheet
            isOpen={sheet === 'category'}
            title="Категорія"
            options={categoryOptions}
            value={category}
            onSelect={changeCategory}
            onClose={closeSheet}
          />
        </>
      )}
      <OptionSheet
        isOpen={sheet === 'project'}
        title="Проєкт"
        options={projectOptions}
        value={projectId}
        onSelect={changeProject}
        onClose={closeSheet}
      />
      <OptionSheet
        isOpen={sheet === 'workspace'}
        title="Простір"
        options={workspaceOptions}
        value={selectedWorkspace?.id ?? ''}
        onSelect={changeWorkspace}
        onClose={closeSheet}
      />
    </>

  );
}