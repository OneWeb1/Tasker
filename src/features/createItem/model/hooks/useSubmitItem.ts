import { useCallback } from 'react';
import { useCreateNoteMutation, useUpdateNoteMutation } from '@/entities/note';
import type { NewNote } from '@/entities/note';
import { useCreateTaskMutation, useUpdateTaskMutation } from '@/entities/task';
import type { NewTask } from '@/entities/task';

export function useSubmitItem() {
  const [createTask] = useCreateTaskMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [createNote] = useCreateNoteMutation();
  const [updateNote] = useUpdateNoteMutation();

  const submitTask = useCallback(
    async (input: NewTask) => {
      await createTask(input).unwrap();
    },
    [createTask],
  );

  const submitTaskUpdate = useCallback(
    async (id: string, patch: Partial<NewTask>) => {
      await updateTask({ id, patch }).unwrap();
    },
    [updateTask],
  );

  const submitNote = useCallback(
    async (input: NewNote) => {
      await createNote(input).unwrap();
    },
    [createNote],
  );

  const submitNoteUpdate = useCallback(
    async (id: string, patch: Partial<NewNote>) => {
      await updateNote({ id, patch }).unwrap();
    },
    [updateNote],
  );

  return { submitTask, submitTaskUpdate, submitNote, submitNoteUpdate };
}