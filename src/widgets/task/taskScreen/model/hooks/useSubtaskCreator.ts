import { useCallback, useState } from 'react';
import type { FormEvent } from 'react';
import { getSubtaskBounds } from '@/entities/task';
import type { Task, TaskContentPatch, TaskDetailsStatus, TaskPriority } from '@/entities/task';
import type { TaskDates } from '@/features/task/editTask';
import type { NewSubtask } from '@/features/task/subtasks';
import { DRAFT_SUBTASK_ID, DRAFT_SUBTASK_TITLE } from '../constants/subtaskCreator';
import type { DatesBounds } from '../types/datesBounds';

export type SubtaskCreatorSheet = 'status' | 'dates' | 'priority';

export function useSubtaskCreator(parent: Task, onSubmit: (draft: NewSubtask) => void) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [done, setDone] = useState(false);
  const [priority, setPriority] = useState<TaskPriority | undefined>(undefined);
  const [ownDates, setOwnDates] = useState<TaskDates | null>(null);
  const [sheet, setSheet] = useState<SubtaskCreatorSheet | null>(null);
  const [extras, setExtras] = useState<TaskContentPatch>({});

  const patchDraft = useCallback((patch: TaskContentPatch) => {
    setExtras((previous) => ({ ...previous, ...patch }));
  }, []);

  const bounds: DatesBounds = getSubtaskBounds(parent);
  const inheritedDates: TaskDates = {
    date: parent.date,
    endDate: parent.endDate ?? null,
    startTime: parent.startTime,
    endTime: parent.endTime,
  };
  const dates = ownDates ?? inheritedDates;
  const status: TaskDetailsStatus = done ? 'done' : 'active';
  const trimmedTitle = title.trim();
  const isValid = trimmedTitle !== '';

  const draftTask: Task = {
    ...extras,
    id: DRAFT_SUBTASK_ID,
    title: trimmedTitle || DRAFT_SUBTASK_TITLE,
    categoryId: parent.categoryId,
    projectId: parent.projectId,
    date: dates.date,
    endDate: dates.endDate ?? null,
    startTime: dates.startTime,
    endTime: dates.endTime,
    status: 'active',
  };

  const openSheet = (next: SubtaskCreatorSheet) => setSheet(next);
  const closeSheet = () => setSheet(null);

  const changeStatus = (next: TaskDetailsStatus) => {
    setDone(next === 'done');
    setSheet(null);
  };

  const changePriority = (value: TaskPriority | undefined) => {
    setPriority(value);
    setSheet(null);
  };

  const changeDates = (next: TaskDates) => {
    setOwnDates(next);
    setSheet(null);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!isValid) return;

    onSubmit({
      title: trimmedTitle,
      done,
      description: description.trim() || undefined,
      priority,
      ...extras,
      ...(ownDates && {
        date: ownDates.date,
        endDate: ownDates.endDate ?? null,
        startTime: ownDates.startTime,
        endTime: ownDates.endTime,
      }),
    });
  };

  return {
    title,
    setTitle,
    description,
    setDescription,
    priority,
    status,
    dates,
    bounds,
    draftTask,
    patchDraft,
    isValid,
    sheet,
    openSheet,
    closeSheet,
    changeStatus,
    changePriority,
    changeDates,
    handleSubmit,
  };
}