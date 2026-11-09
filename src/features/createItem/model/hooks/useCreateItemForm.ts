import { useCallback, useState } from 'react';
import type { FormEvent } from 'react';
import {
  DEFAULT_CATEGORY_ID,
  filterCategoriesByWorkspace,
  useGetCategoriesQuery,
} from '@/entities/category';
import type { CategoryId } from '@/entities/category';
import { addNoteTag, buildNoteTimestamp, removeNoteTag } from '@/entities/note';
import type { Note } from '@/entities/note';
import { useGetProjectsQuery } from '@/entities/project';
import type { Task, TaskContentPatch, TaskPriority, TaskSchedule } from '@/entities/task';
import { resolveWorkspaceId } from '@/entities/workspace';
import { getTodayKey, parseDateKey } from '@/shared/lib/utils/date';
import {
  DEFAULT_END_TIME,
  DEFAULT_START_TIME,
  DRAFT_TASK_ID,
  DRAFT_TASK_TITLE,
} from '../constants/createItem';
import { isCreateItemValid } from '../lib/isCreateItemValid';
import { useCreateItem } from './useCreateItem';
import { useSubmitItem } from './useSubmitItem';

type SubmitStatus = 'idle' | 'submitting' | 'error';
type NoteAttachments = NonNullable<Note['attachments']>;
type NoteAlign = NonNullable<Note['textAlign']>;

export function useCreateItemForm(
  defaultDate: string,
  defaultWorkspaceId: string,
  defaultProjectId: string,
) {
  const { kind, categoryId, task, note, close } = useCreateItem();
  const { submitTask, submitTaskUpdate, submitNote, submitNoteUpdate } = useSubmitItem();
  const { data: projects = [] } = useGetProjectsQuery();
    const { data: allCategories = [] } = useGetCategoriesQuery();

  const [title, setTitle] = useState(task?.title ?? note?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [content, setContent] = useState(note?.content ?? '');
  const [attachments, setAttachments] = useState<NoteAttachments>(note?.attachments ?? []);
  const [textAlign, setTextAlign] = useState<NoteAlign>(note?.textAlign ?? 'left');
  const [tags, setTags] = useState<string[]>(note?.tags ?? []);
  const [color, setColor] = useState<string>(note?.color ?? '');
  const [category, setCategory] = useState<CategoryId>(task?.categoryId ?? categoryId);
  const [projectId, setProjectId] = useState(
    task?.projectId ?? note?.projectId ?? (kind === 'note' && !note ? defaultProjectId : ''),
  );
  const [workspaceId, setWorkspaceId] = useState<string>(
    task || note
      ? resolveWorkspaceId((task ?? note)?.workspaceId)
      : defaultWorkspaceId,
  );
  const today = getTodayKey();
  const minDate = task && task.date < today ? task.date : today;
  const initialDate = task?.date ?? (defaultDate > today ? defaultDate : today);
  const [date, setDate] = useState(initialDate);
  const [endDate, setEndDate] = useState<string | null>(task?.endDate ?? null);
  const [hasTime, setHasTime] = useState(Boolean(task?.startTime && task.endTime));
  const [startTime, setStartTime] = useState(task?.startTime ?? DEFAULT_START_TIME);
  const [endTime, setEndTime] = useState(task?.endTime ?? DEFAULT_END_TIME);
  const [schedule, setSchedule] = useState<TaskSchedule>(task?.schedule ?? 'once');
  const [weekdays, setWeekdays] = useState<number[]>(
    task?.weekdays?.length ? task.weekdays : [parseDateKey(initialDate).getDay()],
  );
  const [priority, setPriority] = useState<TaskPriority | undefined>(task?.priority);
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [extras, setExtras] = useState<TaskContentPatch>({});

    const categories = filterCategoriesByWorkspace(allCategories, workspaceId);

  const changeWorkspaceId = (id: string) => {
    setWorkspaceId(id);
    if (!filterCategoriesByWorkspace(allCategories, id).some((item) => item.id === category)) {
      setCategory(DEFAULT_CATEGORY_ID);
    }
  };

    const trimmedTitle = title.trim();

  const addTag = useCallback((raw: string) => {
    setTags((previous) => addNoteTag(previous, raw));
  }, []);

  const removeTag = useCallback((tag: string) => {
    setTags((previous) => removeNoteTag(previous, tag));
  }, []);

  const patchDraft = useCallback((patch: TaskContentPatch) => {
    setExtras((previous) => ({ ...previous, ...patch }));
  }, []);

  const draftTask: Task = {
    ...extras,
    id: DRAFT_TASK_ID,
    title: trimmedTitle || DRAFT_TASK_TITLE,
    categoryId: category,
    projectId: projectId || null,
    workspaceId,
    date,
    endDate,
    startTime: hasTime ? startTime : null,
    endTime: hasTime ? endTime : null,
    schedule,
    status: 'active',
  };
  const isValid = isCreateItemValid({
    kind,
    title: trimmedTitle,
    date,
    minDate,
    schedule,
    weekdays,
    hasTime,
    startTime,
    endTime,
  });

  const toggleWeekday = (weekday: number) => {
    setWeekdays((previous) =>
      previous.includes(weekday)
        ? previous.filter((value) => value !== weekday)
        : [...previous, weekday].sort((a, b) => a - b),
    );
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!isValid) return;

    setStatus('submitting');
    try {
      if (kind === 'task') {
        const fields = {
          title: trimmedTitle,
          description: description.trim(),
          categoryId: category,
          projectId: projectId || null,
          workspaceId,
          date,
          endDate: schedule === 'once' ? endDate : null,
          startTime: hasTime ? startTime : null,
          endTime: hasTime ? endTime : null,
          schedule,
          weekdays: schedule === 'weekly' ? weekdays : [],
          priority,
        };
        if (task) await submitTaskUpdate(task.id, fields);
        else await submitTask({ ...fields, ...extras, status: 'active' });
      } else {
        const noteFields = {
          title: trimmedTitle,
          content: content.trim(),
          attachments,
          textAlign,
          updatedAt: note ? Date.now() : buildNoteTimestamp(defaultDate),
          workspaceId,
          projectId: projectId || null,
                    tags,
          color: color || undefined,
        };
        if (note) await submitNoteUpdate(note.id, noteFields);
        else await submitNote(noteFields);
      }
      close();
    } catch {
      setStatus('error');
    }
  };

  return {
    kind,
    title,
    setTitle,
    description,
    setDescription,
    content,
    setContent,
    attachments,
    setAttachments,
    textAlign,
    setTextAlign,
    tags,
    addTag,
    removeTag,
    color,
    setColor,
    category,
    setCategory,
    projectId,
    setProjectId,
    workspaceId,
    setWorkspaceId: changeWorkspaceId,
    date,
    setDate,
    endDate,
    setEndDate,
    minDate,
    hasTime,
    setHasTime,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    schedule,
    setSchedule,
    priority,
    setPriority,
    weekdays,
    toggleWeekday,
    draftTask,
    patchDraft,
    projects,
    categories,
    isEditing: task !== null || note !== null,
    isSubmitting: status === 'submitting',
    hasError: status === 'error',
    isValid,
    handleSubmit,
  };
}